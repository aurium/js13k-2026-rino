// A música acompanha o ritmo do jogo: mais rápida com rino.s ou dash (rino.D).

const melodyNotes = 'B1B1C2D2B2A2B2G2B1B1A2G2E2B1B1A2R2B1B1C2D2B2A2B2G2B1B1A2G2E2B1B1A2R2D1D1D1D1E2A1A1A1A1A2G1G1G1G1G2';
const noteFrequency = { C: 523, D: 587, E: 330, F: 349, G: 392, A: 440, B: 494 };

let audioContext, musicStep = 0;

// Descansa em silêncio até o primeiro gesto do usuário (política de autoplay).
addEventListener('pointerdown', startMusic, { once: true });

function startMusic() {
  audioContext = new (AudioContext||webkitAudioContext)();
  musicBeat();
}

function musicBeat() {
  if (!mON.checked) return setTimeout(musicBeat, 99);
  // Rítmo: a melodia anda junto com o rino; no dash fica 3x mais rápida.
  const beatDuration = .1 + .1 / (rino.D ? 2 : rino.s || 1);

  // Lê o par nota+duração da vez (nota e duração sempre em pares).
  const pairPosition = musicStep * 2;
  const letter = melodyNotes[pairPosition];
  const beats = +melodyNotes[pairPosition + 1];
  musicStep = (musicStep + 1) % (melodyNotes.length / 2);

  const noteDuration = beats * beatDuration;
  const frequency = noteFrequency[letter];

  if (frequency) { // Nota principal (sawtooth suave).
    note(frequency, .9 * noteDuration*2, 0.1);
    note(frequency * 2, .9 * noteDuration*2, 0.05);
  }

  setTimeout(musicBeat, noteDuration * 1000);
}

function note(frequency, duration, volume) {
  playSound(frequency*.9, frequency, .1, volume)(duration);
}

function playSound(freqFrom, freqTo, delay, volume=.5) {
  if (!audioContext) return ()=>0;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const t = audioContext.currentTime;
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(freqFrom, t);
  oscillator.frequency.linearRampToValueAtTime(freqTo, t + delay/2);
  oscillator.connect(gain).connect(audioContext.destination);
  gain.gain.setValueAtTime(volume, t);
  oscillator.start(t);
  return (delay=.5)=> {
    let end = audioContext.currentTime + delay;
    gain.gain.linearRampToValueAtTime(.001, end);
    oscillator.stop(end);
  }
}
