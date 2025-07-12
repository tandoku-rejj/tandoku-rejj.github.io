// DOM Elements
const elements = {
    wordsSelect: document.getElementById('words-select'),
    textContainer: document.getElementById("text-container")
};

const wordsVersionMapping = {
    v1: v1Words,
    v2: v2Words,
}

function downloadPDF() {
    const words = wordsVersionMapping[elements.wordsSelect.value]
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const maxY = 280;
    const marginLeft = 10;
    const marginRight = 110;

    // Two column layout
    let x = marginLeft;
    let y = 10;
    let colIndex = 0;

    words.forEach((word) => {
        if (y > maxY) {
            if (colIndex === 0) {
                colIndex = 1;
                x = marginRight;
                y = 10;
            } else {
                doc.addPage();
                colIndex = 0;
                x = marginLeft;
                y = 10;
            }
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Next word: ${word.word} (${word.type})`, x, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.text(word.definition, x, y + 4);

        y += 14;
    });

    doc.save('vocabulary-words.pdf');
}

function generateForRecord() {
    const words = wordsVersionMapping[elements.wordsSelect.value]
    
    // Single column layout
    let y = 10;
    let str = "";

    words.forEach((word) => {
        str = `
            ${str}
            <strong>Next word: ${word.word}</strong><br>
            <div>${word.type}</div>
            <div>${word.definition}</div>
            <br>
        `;
    });
    elements.textContainer.innerHTML = str;
}
