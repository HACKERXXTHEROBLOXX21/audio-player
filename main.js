
const audio = document.getElementById('audio');
const ctx = new AudioContext();
const sourceNode = ctx.createMediaElementSource(audio);
const gainNode = ctx.createGain();
const bassEQ = ctx.createBiquadFilter();
bassEQ.type = 'lowshelf';
bassEQ.frequency.value = 200;

const pitchNode = new PlaybackRateController(audio);
const analyser = ctx.createAnalyser();
const canvas = document.getElementById("waveform");
const ctx2d = canvas.getContext("2d");

sourceNode.connect(bassEQ).connect(gainNode).connect(analyser).connect(ctx.destination);

document.getElementById("volume").addEventListener("input", (e) => {
    gainNode.gain.value = parseFloat(e.target.value);
});
document.getElementById("pitch").addEventListener("input", (e) => {
    audio.playbackRate = parseFloat(e.target.value);
});
document.getElementById("bass").addEventListener("input", (e) => {
    bassEQ.gain.value = parseFloat(e.target.value);
});

document.getElementById("audioFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type === "audio/mp3") {
        const reader = new FileReader();
        reader.onload = function(ev) {
            audio.src = ev.target.result;
            audio.load();
            audio.play();
        }
        reader.readAsDataURL(file);
    } else {
        alert("Song not found! Please try again.");
    }
});

function drawWaveform() {
    requestAnimationFrame(drawWaveform);
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);
    ctx2d.beginPath();
    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
        x += sliceWidth;
    }
    ctx2d.lineTo(canvas.width, canvas.height / 2);
    ctx2d.strokeStyle = "#0f0";
    ctx2d.stroke();
}
drawWaveform();

function saveEQ() {
    const preset = {
        volume: document.getElementById("volume").value,
        pitch: document.getElementById("pitch").value,
        bass: document.getElementById("bass").value
    };
    localStorage.setItem("eqPreset", JSON.stringify(preset));
    alert("EQ Preset saved!");
}

function loadEQ() {
    const preset = JSON.parse(localStorage.getItem("eqPreset"));
    if (preset) {
        document.getElementById("volume").value = preset.volume;
        document.getElementById("pitch").value = preset.pitch;
        document.getElementById("bass").value = preset.bass;
        gainNode.gain.value = parseFloat(preset.volume);
        audio.playbackRate = parseFloat(preset.pitch);
        bassEQ.gain.value = parseFloat(preset.bass);
        alert("EQ Preset loaded!");
    } else {
        alert("No EQ preset found!");
    }
}
