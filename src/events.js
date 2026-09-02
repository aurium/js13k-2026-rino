document.onkeydown = (ev)=> {
  if (ev.repeat) return;
  if (inputDisabled) return;
  if (ev.key == 'ArrowRight') worker.postMessage(['Rgr1'])
  if (ev.key == 'ArrowLeft') worker.postMessage(['Rgl1'])
  if (ev.key == 'ArrowUp') {
    worker.postMessage(['Rj1']) // Rino wants to start Jump.
  }
}

document.onkeyup = (ev)=> {
  if (ev.key == 'ArrowRight') worker.postMessage(['Rgr0'])
  if (ev.key == 'ArrowLeft') worker.postMessage(['Rgl0'])
  if (ev.key == 'ArrowUp') {
    worker.postMessage(['Rj0']) // Rino stops the Jump impulse.
  }
}

worker.onmessage = ({data: [event, payload]})=> {
  if (event=='A') {
    log('Worker is Alive!');
    cover.onclick = ()=> {
      cover.onclick = null;
      initGame();
    }
    setTimeout(cover.onclick, 1); // AUTO START for DEV MODE!
  }
  if (event=='E') { // Update Elements
    payload.forEach((el, i)=> {
      // Update element, without replacing draw func and angle:
      elements[i] = { ...el, d:elements[i].d, a:elements[i].a };
      if (el.P) rino = elements[i];
    })
  }
  if (event=='NC') { // New Chapter
    if (payload) curChapterNum = payload;
    else curChapterNum++;
    nextChapter();
  }
}
