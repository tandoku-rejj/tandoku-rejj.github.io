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

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance();
  utterance.text = `${currentWord.word}. ${currentWord.type}. ${currentWord.definition}`;
  utterance.rate = speechSettings.rate;
  utterance.pitch = speechSettings.pitch;

  if (speechSettings.voice) {
    utterance.voice = speechSettings.voice;
  }

  window.speechSynthesis.speak(utterance);
}