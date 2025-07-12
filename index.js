// DOM Elements
const elements = {
  wordDisplay: document.getElementById('word-display'),
  typeDisplay: document.getElementById('type-display'),
  definitionDisplay: document.getElementById('definition-display'),
  nextBtn: document.getElementById('next-btn'),
  revealBtn: document.getElementById('reveal-btn'),
  speakBtn: document.getElementById('speak-btn'),
  voiceSelect: document.getElementById('voice-select'),
  rateControl: document.getElementById('rate-control'),
  pitchControl: document.getElementById('pitch-control'),
  rateValue: document.getElementById('rate-value'),
  pitchValue: document.getElementById('pitch-value')
};

// App State
let currentWord = null;
let voices = [];
let isRevealed = false;
const speechSettings = {
  voice: null,
  rate: 0.8,
  pitch: 1
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadRandomWord();
  setupVoiceControls();
  setupEventListeners();
});

// Voice Controls
function setupVoiceControls() {
  voices = speechSynthesis.getVoices();
  populateVoiceList();

  // Update voices when changed
  speechSynthesis.onvoiceschanged = populateVoiceList;

  // Set initial values
  elements.rateValue.textContent = speechSettings.rate;
  elements.pitchValue.textContent = speechSettings.pitch;
}

function populateVoiceList() {
  voices = speechSynthesis.getVoices();
  elements.voiceSelect.innerHTML = '<option value="">Default Voice</option>';

  voices.forEach(voice => {
    const option = document.createElement('option');
    option.textContent = `${voice.name} (${voice.lang})`;
    option.value = voice.name;
    elements.voiceSelect.appendChild(option);
  });
}

// Event Listeners
function setupEventListeners() {
  elements.nextBtn.addEventListener('click', loadRandomWord);
  elements.revealBtn.addEventListener('click', toggleReveal);
  elements.speakBtn.addEventListener('click', speakWord);

  elements.voiceSelect.addEventListener('change', (e) => {
    speechSettings.voice = voices.find(voice => voice.name === e.target.value);
  });

  elements.rateControl.addEventListener('input', (e) => {
    speechSettings.rate = parseFloat(e.target.value);
    elements.rateValue.textContent = e.target.value;
  });

  elements.pitchControl.addEventListener('input', (e) => {
    speechSettings.pitch = parseFloat(e.target.value);
    elements.pitchValue.textContent = e.target.value;
  });
}

// Word Handling
function loadRandomWord() {
  const randomIndex = Math.floor(Math.random() * v1Words.length);
  currentWord = v1Words[randomIndex];

  elements.typeDisplay.textContent = currentWord.type;
  elements.wordDisplay.textContent = currentWord.word;
  elements.definitionDisplay.textContent = currentWord.definition;

  // Reset to hidden state
  isRevealed = false;
  elements.typeDisplay.classList.add('hidden');
  elements.wordDisplay.classList.add('hidden');
  elements.definitionDisplay.classList.add('hidden');
  elements.revealBtn.textContent = 'Reveal';
}

function toggleReveal() {
  isRevealed = !isRevealed;

  elements.typeDisplay.classList.toggle('hidden', !isRevealed);
  elements.wordDisplay.classList.toggle('hidden', !isRevealed);
  elements.definitionDisplay.classList.toggle('hidden', !isRevealed);

  elements.revealBtn.textContent = isRevealed ? 'Hide' : 'Reveal';
}

// Speech Synthesis
function speakWord() {
  if (!currentWord) return;
  window.speechSynthesis.cancel();

  // Process definition to add pauses
  const processedDefinition = currentWord.definition
    .replace(/\. /g, '. ')       // Add space after periods
    .replace(/, /g, ', ')        // Ensure space after commas
    .replace(/; /g, '; ');       // Ensure space after semicolons

  // Create utterances with proper pauses
  const wordUtterance = new SpeechSynthesisUtterance(currentWord.word);
  const typeUtterance = new SpeechSynthesisUtterance(`(${currentWord.type})`);
  const definitionUtterance = new SpeechSynthesisUtterance(processedDefinition);

  // Configure all utterances
  [wordUtterance, typeUtterance, definitionUtterance].forEach(utt => {
    utt.rate = speechSettings.rate * 0.9; // Slightly slower
    utt.pitch = speechSettings.pitch;
    if (speechSettings.voice) utt.voice = speechSettings.voice;
    utt.lang = 'en-US'; // Ensure English pronunciation
  });

  // Queue them with natural pauses
  window.speechSynthesis.speak(wordUtterance);

  wordUtterance.onend = () => setTimeout(() => {
    window.speechSynthesis.speak(typeUtterance);

    typeUtterance.onend = () => setTimeout(() => {
      // Break definition into sentences if too long
      if (processedDefinition.length > 100) {
        speakInChunks(processedDefinition);
      } else {
        window.speechSynthesis.speak(definitionUtterance);
      }
    }, 300); // Pause after type
  }, 200); // Pause after word
}

// Helper function for long definitions
function speakInChunks(text) {
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
  let delay = 0;

  sentences.forEach(sentence => {
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(sentence.trim());
      utterance.rate = speechSettings.rate * 0.85;
      utterance.pitch = speechSettings.pitch;
      if (speechSettings.voice) utterance.voice = speechSettings.voice;
      window.speechSynthesis.speak(utterance);
    }, delay);

    delay += sentence.length * 50; // Dynamic pause based on sentence length
  });
}
// Add to your elements object
elements.downloadCsv = document.getElementById('download-csv');
elements.downloadPdf = document.getElementById('download-pdf');

// Add to your setupEventListeners function
elements.downloadCsv.addEventListener('click', downloadCSV);
elements.downloadPdf.addEventListener('click', downloadPDF);

// Add these new functions
function downloadCSV() {
  let csv = 'Word,Type,Definition\n';
  v1Words.forEach(word => {
    csv += `"${word.word}","${word.type}","${word.definition.replace(/"/g, '""')}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vocabulary-words.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text('Vocabulary Words List', 10, 10);

  let y = 20;
  v1Words.forEach((word, i) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`${i+1}. ${word.word} (${word.type})`, 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(word.definition, 15, y + 7);
    y += 15;
  });

  doc.save('vocabulary-words.pdf');
}