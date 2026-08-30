const nextChapter = ()=> {
  disableInput(1);
  curChapter++;
  log(`Starting Chapeter ${curChapter}:`, chapters[curChapter].t);
  chapters[curChapter].s();
  elements = chapters[curChapter].e;
  rino.P = 1; // is player
  worker.postMessage(['NC', {
    c: curChapter,
    e: elements.map(el => ({ ...el, d:0 }))
  }]); // Notify new Chapter

  oldChapterCanvas = chapterCanvas;
  chapterCanvas = document.createElement('canvas');
  chapterCanvas.r = ()=>void(0); // Do not need a ReDraw
  book.prepend(chapterCanvas);
  onresize();
  const oldCtx = ctx
  ctx = getCtx(chapterCanvas);

  // Hide the left half of the new canvas until the page flip.
  chapterCanvas.style.clipPath = 'rect(auto auto auto 50%)';

  //// Animate pagination //////////////////////////////////////////////

  // Create fliping page:
  const page = document.createElement('canvas');
  book.append(page);
  page.className = 'page';
  page.width = oldChapterCanvas.width / 2;
  page.height = oldChapterCanvas.height;
  const pctx = page.getContext('2d');

  // Copy the right side of oldChapterCanvas to the fliping page:
  pctx.drawImage(oldChapterCanvas,
    page.width, 0, page.width, page.height,
    0,          0, page.width, page.height);
  // Remove the right side of oldChapterCanvas:
  oldCtx.clearRect(page.width, 0, page.width, page.height);

  // Apply the first half of the animation:
  page.style.transition = '1.5s ease-in';
  requestAnimationFrame(()=>
    page.style.transform = 'translate(-50%, -22.3%) scaleX(0) skewY(-25deg)'
  );
  // Define the second half of the animation:
  setTimeout(()=> {
    pctx.translate(page.width, 0);
    pctx.scale(-1, 1);
    pctx.drawImage(chapterCanvas,
      0, 0, page.width, page.height,
      0, 0, page.width, page.height);
    // Apply the second half of the animation:
    page.style.transition = '1s ease-out';
    requestAnimationFrame(()=>
      page.style.transform = 'translate(-100%, 0%) scaleX(-1) skewY(0deg)'
    );
  }, 1500);
  // Remove fliping page:
  setTimeout(()=> {
    chapterCanvas.style.clipPath = null;
    oldChapterCanvas.remove()
    page.remove()
    disableInput(0);
  }, 3000);
}
