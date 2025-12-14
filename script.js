const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playNote(frequency, duration, type = 'sine') {
  // The 'noise' type is not a valid oscillator type.
  // It will be handled by a separate function.
  if (type === 'noise') {
      return;
  }
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration / 1000);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + duration / 1000);
}

function playCode(code) {
  let z = [];
  let s = null;
  let t = 'sine';

  // Find z
  const zMatch = code.match(/z\s*=\s*\[(.*?)\]/);
  if (zMatch) {
    z = zMatch[1].split(',').map(item => item.trim());
  }

  // Find s
  const sMatch = code.match(/s\s*=\s*\[(.*?)\]/);
  if (sMatch) {
    s = sMatch[1].trim();
  }

  // Find t
  const tMatch = code.match(/t\s*=\s*\[(.*?)\]/);
  if (tMatch) {
    t = tMatch[1].trim().toLowerCase();
    if (!['sine', 'square', 'sawtooth', 'triangle', 'noise'].includes(t)) {
        t = 'sine';
    }
  }

  console.log("Interpreter state:", { z, s, t });

  let delay = 0;
  for (const note of z) {
    const frequency = midiToFrequency(parseInt(note));
    if (s) {
        setTimeout(() => {
            playDrum(frequency, 200, t); // Hardcoded duration
        }, delay);
    } else {
        if (t === 'noise') {
            setTimeout(() => {
                playNoise(200); // Hardcoded duration
            }, delay);
        } else {
            if (frequency) {
                setTimeout(() => {
                    playNote(frequency, 200, t); // Hardcoded duration
                }, delay);
            }
        }
    }
    delay += 200; // Hardcoded duration
  }
}

function playDrum(frequency, duration, type) {
    if (type === 'noise') {
        playNoise(duration);
    } else {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration / 1000);

        gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration / 1000);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + duration / 1000);
    }
}

function playNoise(duration) {
    const bufferSize = audioCtx.sampleRate * (duration / 1000);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration / 1000);

    noiseNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noiseNode.start();
}

function midiToFrequency(midi) {
    return Math.pow(2, (midi - 69) / 12) * 440;
}

const listenButton = document.querySelector('.btn');
const codeInput = document.getElementById('name');

listenButton.addEventListener('click', () => {
  const code = codeInput.value;
  playCode(code);
});

const presetSounds = [
  'z=[60,62,64,65,67,69,71,72]; t=[sine]',
  'z=[72,71,69,67,65,64,62,60]; t=[square]',
  'z=[60,60,67,67,69,69,67,67]; t=[sawtooth]',
  'z=[60,64,67,72]; t=[triangle]',
  'z=[100]; t=[noise]',
  'z=[48,52,55,60]; s=[drum]; t=[sine]', // Kick drum pattern
  'z=[60,60,60,60]; s=[drum]; t=[noise]', // Snare drum pattern
  'z=[72,67,64,60,64,67,72]; t=[sine]', // Arpeggio
  'z=[60,62,64,62,65,64,62,60]; t=[square]', // Simple melody
  'z=[48,55,62,67]; s=[drum]; t=[sawtooth]', // Pitched drum pattern
  'z=[60,60,60,60,67,67,67,67]; t=[triangle]', // Rhythmic pattern
  'z=[72,71,72,71,72,71,72,71]; t=[sine]', // Trill
  'z=[48,50,52,53,55,57,59,60]; s=[drum]; t=[square]', // Chromatic drum scale
  'z=[60,67,72,76,79,84]; t=[sawtooth]', // Major chord arpeggio
  'z=[84,79,76,72,67,60]; t=[triangle]', // Major chord arpeggio descending
  'z=[60]; t=[noise]', // Single noise hit
  'z=[48,48,48,48]; s=[drum]; t=[noise]', // Fast snare roll
  'z=[60,61,62,63,64,65,66,67]; t=[sine]' // Chromatic scale
];

const presetButtons = document.querySelectorAll('.frame');
presetButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    if (presetSounds[index]) {
      codeInput.value = presetSounds[index];
      playCode(presetSounds[index]);
    }
  });
});
