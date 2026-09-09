let flippingPage = 0;

const nextChapter = (num)=> {
  flippingPage = 1;
  disableInput(1);

  if (zoom > 1) setZoom(zoom - 1);
  if (curChapterNum) updateCanvas();

  if (curChapterNum!=99) lastChapterNum = curChapterNum;
  rt.textContent = 'Retry chapter '+lastChapterNum;
  curChapterNum = num || curChapterNum+1;
  document.documentElement.className = 'c'+curChapterNum;
  curChapter = chapters[curChapterNum];
  log(`Starting Chapeter ${curChapterNum}:`, curChapter.t);
  camera = 0;
  rainbow = [];
  De.style.opacity = 0;
  curChapter.s();
  camera = { x: rino.x+10, y: rino.y-5 };
  elements = curChapter.e;
  worker.postMessage(['NC', {
    c: curChapterNum,
    e: transmissibleElements()
  }]); // Notify new Chapter

  oldChapterCanvas = chapterCanvas;
  chapterCanvas = document.createElement('canvas');
  chapterCanvas.className = 'cha'; // Chapter
  chapterCanvas.r = ()=>void(0); // Do not need a ReDraw
  book.prepend(chapterCanvas);
  onresize();
  const oldCtx = ctx
  ctx = getCtx(chapterCanvas);
  ctx.lineCap = 'round';

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
  page.style.transition = '1.5s ease-in transform';
  requestAnimationFrame(()=> {
    chapterCanvas.style.filter = 'brightness(1)';
    page.style.transform = 'translate(-50%, -22.3%) scaleX(0) skewY(-25deg)';
    page.style.width = '40vw'
  });
  // Define the second half of the animation:
  setTimeout(()=> {
    pctx.translate(page.width, 0);
    pctx.scale(-1, 1);
    pctx.drawImage(chapterCanvas,
      0, 0, page.width, page.height,
      0, 0, page.width, page.height);
    // Apply the second half of the animation:
    page.style.transition = '1s ease-out';
    requestAnimationFrame(()=> {
      page.style.transform = 'translate(-100%, 0%) scaleX(-1) skewY(0deg)';
      oldChapterCanvas.style.filter = 'brightness(0)';
    });
  }, 1500);
  // Remove fliping page:
  setTimeout(()=> {
    chapterCanvas.style.clipPath = null;
    oldChapterCanvas.remove()
    page.remove()
    disableInput(0);
    flippingPage = 0;
    De.style.opacity = 1;
  }, 3000);
}
