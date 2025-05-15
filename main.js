
let audio = document.getElementById('audio');
let warning = document.getElementById('warning');
let context, source, analyser, gainNode, bassFilter;
let canvas = document.getElementById('visualizer');
let ctx = canvas.getContext('2d');

document.getElementById('audio-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type === 'audio/mpeg') {
        const url = URL.createObjectURL(file);
        setupAudio(url);
    } else {
        warning.textContent = "Song not found! Please try again";
    }
});

function loadURL() {
    const url = document.getElementById('url-input').value;
    if (url && url.endsWith('.mp3')) {
        setupAudio(url);
    } else {
        warning.textContent = "Song not found! Please try again";
    }
}

function setupAudio(src) {
    warning.textContent = "";
    if (context) context.close();
    context = new (window.AudioContext || window.webkitAudioContext)();
    audio.src = src;
    source = context.createMediaElementSource(audio);
    gainNode = context.createGain();
    bassFilter = context.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 200;

    analyser = context.createAnalyser();
    source.connect(bassFilter);
    bassFilter.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(context.destination);

    visualize();

    document.getElementById('volume').addEventListener('input', function() {
        gainNode.gain.value = this.value;
    });

    document.getElementById('bass').addEventListener('input', function() {
        bassFilter.gain.value = this.value - 100;
    });

    document.getElementById('pitch').addEventListener('input', function() {
        const val = this.value / 100;
        audio.playbackRate = val; // Placeholder for actual pitch processing
    });
}

function visualize() {
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];
            ctx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
            ctx.fillRect(x, canvas.height - barHeight/2, barWidth, barHeight/2);
            x += barWidth + 1;
        }
    }
    draw();
}
