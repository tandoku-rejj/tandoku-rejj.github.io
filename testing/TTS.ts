/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs"
import path from "path";
import { word01 } from "./words";

// ✅ Dictionary configs
const DICTIONARIES: Record<string, { key: string; label: string }> = {
    collegiate: {
        key: "3fb919d1-60ae-4dcf-a840-144834b467f8",
        label: "Collegiate",
    },
    learners: {
        key: "e2047601-1c37-401b-8a7a-8e9ca7216f0d",
        label: "Learner's",
    },
};

// ✅ Output containers
const rawDefinitions: Record<string, any> = {};
let humanReadable = "";

/**
 * Fetch definition from a specific dictionary
 */
async function fetchFromDictionary(
    word: string,
    dictId: string
): Promise<{ data: any[]; dictLabel: string } | null> {
    const dict = DICTIONARIES[dictId];
    const url = `https://www.dictionaryapi.com/api/v3/references/${dictId}/json/${word}?key=${dict.key}`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as any[];
        return { data, dictLabel: dict.label };
    } catch (err) {
        console.error(
            `❌ Error fetching from ${dict.label} for ${word}:`,
            (err as Error).message
        );
        return null;
    }
}

/**
 * Try dictionaries in order until a valid entry is found
 */
async function fetchDefinition(word: string): Promise<void> {
    for (const dictId of Object.keys(DICTIONARIES)) {
        const result = await fetchFromDictionary(word, dictId);
        if (!result || !result.data) {
            continue;
        }

        const entry = result.data.find((item: any) => item.shortdef && item.fl);
        if (entry) {
            rawDefinitions[word] = result.data;

            const partOfSpeech = entry.fl;
            const shortDef = entry.shortdef.join("; ");
            humanReadable += `Next word: ${word}\n${partOfSpeech}\n${shortDef}\n\n`;
            return;
        }
    }

    // Not found in any dictionary
    rawDefinitions[word] = null;
    humanReadable += `Next word: ${word}\n\n\n\n`;
}

// ✅ Main execution
async function run(): Promise<void> {
    for (const word of word01) {
        await fetchDefinition(word);
    }

    const outputDir = "testing/generatedFiles";
    fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(path.join(outputDir, "word01.txt"), humanReadable);

    console.log("✅ Done. Files saved: word01.json and word01.txt");
}

run();
