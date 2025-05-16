const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

function visualize(analyser, waveformStyleSelector) {
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    if (!source || !isPlaying) return;

    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const style = waveformStyleSelector.value;

    if (style === "bars") {
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);
        x += barWidth + 1;
      }
    } else if (style === "line") {
      analyser.getByteTimeDomainData(dataArray);
      ctx.beginPath();
      ctx.strokeStyle = "#00ffcc";
      ctx.lineWidth = 2;
      for (let i = 0; i < bufferLength; i++) {
        const x = (i / bufferLength) * canvas.width;
        const y = (dataArray[i] / 255.0) * canvas.height;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (style === "circle") {
      const radius = 80;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx.beginPath();
      for (let i = 0; i < bufferLength; i++) {
        const angle = (i / bufferLength) * 2 * Math.PI;
        const r = radius + dataArray[i] / 5;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "#ff33cc";
      ctx.stroke();
    }
  }

  draw();
}
