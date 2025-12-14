// JavaScript to make the frame scrollable
const frame = document.getElementById('scrolling-frame');
function scrollFrame(direction) {
    frame.scrollBy(0, direction);
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playNote(frequency, duration) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration / 1000);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + duration / 1000);
}

function playCode(code) {
  const notes = code.split(';');
  let delay = 0;
  for (const note of notes) {
    const [frequency, duration] = note.split(',');
    if (frequency && duration) {
      setTimeout(() => {
        playNote(parseInt(frequency), parseInt(duration));
      }, delay);
      delay += parseInt(duration);
    }
  }
}

const listenButton = document.querySelector('.btn');
const codeInput = document.getElementById('name');

listenButton.addEventListener('click', () => {
  const code = codeInput.value;
  playCode(code);
});

const presetSounds = [
  '440,100;550,100;660,100;880,100', // The 42 Drums
  '261,200;293,200;329,200;349,200;392,200;440,200;493,200;523,200', // Funny Song!
  '392,100;440,100;493,100;523,100;587,100;659,100;698,100;784,100', // ZZ Melodi
  '100,500;100,500;100,500', // THE [.] BOX
  '800,1000;700,500;600,250', // Weird, dreamy sound
  '800,1000;700,500;600,250;800,100;700,50;600,25', // The Box but dreamier
  '330,100;440,100;495,100;550,100;660,100;880,100', // Cool 8-bit music
  '440,100;523,100;587,100;659,100;698,100;784,100;880,100;988,100', // The 24 Melody?
  '1000,50;1200,50;1400,50;1600,50;1800,50;2000,50', // Voice code
  '784,100;988,100;1175,100;1319,100;1397,100;1568,100', // 20th Century Fox
  '440,100;0,50;550,100;0,50;660,100;0,50;880,100', // 42 Melody with delay
  '220,1000;233,1000;247,1000;261,1000', // Sound base for Eggs trombone
  '100,200;150,200;125,200;175,200', // Guitar when you smashed your finger
  '200,100;250,100;300,100;350,100;400,100;450,100;500,100', // Dog Days - Bags N Buckets
  '500,100;450,100;400,100;350,100;300,100;250,100;200,100', // Santi Banti - Bags N Buckets
  '50,1000;40,1000;30,1000;20,1000', // THE VOID IS COMING
  '100,50;120,50;140,50;160,50;180,50;200,50;220,50;240,50', // ZANOPORTOA DA DARk
  '100,1000;200,500;300,250;400,125' // Summoning Ghosts
];

const presetButtons = document.querySelectorAll('.frame');
presetButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    playCode(presetSounds[index]);
  });
});
