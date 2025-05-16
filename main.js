let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let source, audioBuffer, analyser, gainNode;
let isPlaying = false;

const pitchSlider = document.getElementById("pitchSlider");
const waveformStyle = document.getElementById("waveformStyle");

document.getElementById("audioFile").addEventListener("change", handleAudio);
document.getElementById("play").addEventListener("click", playAudio);
document.getElementById("pause").addEventListener("click", pauseAudio);
document.getElementById("stop").addEventListener("click", stopAudio);
pitchSlider.addEventListener("input", () => {
  if (source) source.playbackRate.value = parseFloat(pitchSlider.value);
});

function handleAudio(event) {
  const file = event.target.files[0];
  if (!file) return alert("Song not found! Please try again");

  const reader = new FileReader();
  reader.onload = function(e) {
    audioContext.decodeAudioData(e.target.result, (buffer) => {
      audioBuffer = buffer;
    });
  };
  reader.readAsArrayBuffer(file);
}

function playAudio() {
  if (!audioBuffer) return alert("Upload an MP3 file first!");

  stopAudio();

  source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.playbackRate.value = parseFloat(pitchSlider.value);

  analyser = audioContext.createAnalyser();
  gainNode = audioContext.createGain();

  source.connect(analyser);
  analyser.connect(gainNode);
  gainNode.connect(audioContext.destination);

  source.start(0);
  isPlaying = true;

  visualize(analyser, waveformStyle);
}

function pauseAudio() {
  if (source) source.stop();
  isPlaying = false;
}

function stopAudio() {
  try {
    if (source) {
      source.stop();
      source.disconnect();
    }
  } catch {}
  isPlaying = false;
}
