
function initGame() {

  nextChapter();

  let lastTime = performance.now();
  let tic = 0;

  setInterval(() => {
    tic++;
    if (tic%20 == 0) {
      const now = performance.now();
      const fps = 20_000 / (now - lastTime)
      dbg.textContent = `FPS: ${fps.toFixed(1)} - `
                      + `Zoom: ${zoom} - `
                      + `Size: ${chapterCanvas.width}x${chapterCanvas.height}`;
      lastTime = now;
      if (fps < 40) setZoom(zoom + 1)
    }

    ctx.fillStyle = '#EEE';
    ctx.fillRect(0, 0, chapterCanvas.width, chapterCanvas.height);

    ctx.sae();
    // camera.x+=.002;
    // camera.y+=.001;
    ctx.tre(40, 20);
    for (let z=6; z>0; z--) {
      // INI drop distance fade
      drawingPlanZ = 1;
      ctx.fillStyle = '#EEE'+(z==1 ? 7 : 3);
      ctx.fiRt(-40, -20, 80, 40);
      // END distance fade
      // INI draw elements for the current Z plan
      ctx.sae();
      ctx.scale(1/(.75+z/4), 1/(.75+z/4));
      drawingPlanZ = z;
      for (const el of chapters[curChapter].e.filter(el=>el.z==z)) {
        el.d(tic)
      }
      ctx.ree();
      // END draw elements for the current Z plan
    }
    ctx.ree();
    writeTitle(ctx);
  }, 16);
}
