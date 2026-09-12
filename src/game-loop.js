let lastTime, tic = 0;

function initGame() {
  nextChapter();
  lastTime = performance.now()
  setInterval(updateCanvas, 16);
}

function updateCanvas() {
    tic++;
    if (tic%20 == 0) {
      let now = performance.now();
      fps = 20_000 / (now - lastTime)
      dbg.textContent = `FPS: ${fps.toFixed(1)} - `                               // DEV ONLY
                      + `Zoom: ${zoom} - `                                        // DEV ONLY
                      + `Size: ${chapterCanvas.width}x${chapterCanvas.height} - ` // DEV ONLY
                      + `rino.x: ${rino.x.toFixed(2)} - `                         // DEV ONLY
                      + `camera: {x:${camera.x.toFixed(2)}}`;                     // DEV ONLY
      lastTime = now;
      if (!flippingPage && fps < 40) setZoom(zoom + 1)
    }

    if (rino.l != rinoLife) {
      rinoLife = rino.l;
      life.innerHTML = '♥'.repeat(rinoLife) + `<b>${'♥'.repeat(10-rinoLife)}</b>`;
    }
    De.style.setProperty('--v', rino.De+'px');

    curChapter.T0?.(tic); // Chapter Tic. Allows toupdate History and objects.

    /* * * BEGIN Update Camara * * * * * * * * * * * * * */
    let targetX = rino.x + 10*rino.r;
    // Camera dist X to Target = abs(camera.x - targetX)
    let multCamDistX = sqrt(abs(camera.x - targetX))*10;
    camera.x = (camera.x*multCamDistX + targetX) / (multCamDistX+1);
    let targetY = rino.y>0 ? rino.y/2 : rino.y-5;
    let multCamDistY = sqrt(abs(camera.y - targetY))*5;
    camera.y = (camera.y*multCamDistY + targetY) / (multCamDistY+1);
    /* * * END Update Camara * * * * * * * * * * * * * * */

    ctx.fillStyle = '#EEE';
    ctx.fillRect(0, 0, chapterCanvas.width, chapterCanvas.height);

    ctx.sae();
    ctx.tre(40, 20);
    for (let z=6; z>0; z--) {
      // INI drop distance fade
      drawingPlanZ = 1;
      ctx.fillStyle = '#EEE'+(z==1 ? 7 : 3);
      ctx.fiRt(-40, -20, 80, 40);
      // END distance fade
      curChapter.T1?.(z); // Chapter specific drawings, Before Z level.
      // INI draw elements for the current Z plan
      ctx.sae();
      ctx.scale(1/(.75+z/4), 1/(.75+z/4));
      drawingPlanZ = z;
      if (z == rino.z) {
        for (let glitter of rainbow) {
          glitter.x += glitter.vx;
          glitter.y += glitter.vy;
          ctx.C(glitter.x, glitter.y, glitter.r+Math.sqrt(glitter.t/200), glitter.c);
        }
        rainbow = rainbow.filter(g => g.t++ < 400);
      }
      let camL = camera.x - 40*z, camR = camera.x + 40*z;
      for (const el of elements.filter(el=>el.z==z).sort(sortElementsForPrinting)) {
        // Draw the element, only if it is visible:
        if (el.L < camR && el.R > camL) el.d(tic);
        //else log('Ignore',el.K, el.id||' ')
      }
      ctx.ree();
      curChapter.T2?.(z); // Chapter specific drawings, After Z level.
      // END draw elements for the current Z plan
    }
    ctx.ree();
    writeTitle(ctx);
    writeHist();
}

function sortElementsForPrinting(a, b) {
  let aN = a.K=='F' ? a.T : a.B-1;
  let bN = b.K=='F' ? b.T : b.B-1;
  return aN < bN ? -1 : 1;
}
