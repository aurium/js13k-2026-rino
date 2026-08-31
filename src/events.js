document.onkeydown = (ev)=> {
  if (inputDisabled) return;
  if (ev.key == 'ArrowRight') { rino.w=1; rino.r=1 }
  if (ev.key == 'ArrowLeft') { rino.w=1; rino.r=-1 }
  if (ev.key == 'ArrowUp') {
    worker.postMessage(['Rj1']) // Rino wants to start Jump.
  }
  worker.postMessage(['R', { w: rino.w, r: rino.r }])
}

document.onkeyup = (ev)=> {
  if (ev.key == 'ArrowRight') { if (rino.r==1) rino.w=0 }
  if (ev.key == 'ArrowLeft') { if (rino.r==-1) rino.w=0 }
  if (ev.key == 'ArrowUp') {
    worker.postMessage(['Rj0']) // Rino stops the Jump impulse.
  }
  worker.postMessage(['R', { w: rino.w, r: rino.r }])
}

worker.onmessage = ({data: [event, payload]})=> {
  if (event=='A') {
    log('Worker is Alive!')
    cover.onclick = ()=> {
      cover.onclick = null
      initGame()
    }
    setTimeout(cover.onclick, 1); // AUTO START for DEV MODE!
  }
  if (event=='E') { // Update Elements
    payload.forEach((el, i)=> {
      elements[i] = { ...el, d:elements[i].d };
      if (el.P) rino = elements[i];
    })
  }
}
