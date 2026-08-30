postMessage(['A']);

let rino,
  rinoJumpTimeout,
  rinoVY,
  rinoPawBackLanded,
  rinoPawFrontLanded,
  elements;

self.onmessage = ({data: [event, payload]})=> {
  if (event == 'NC') { // New Chapter
    elements = payload.e;
    rino = elements.find(el => el.P); // P==truish identifies the player.
    console.log('Current Chapter:',payload.c);
    console.log('Elements:',payload.e);
    chapterInit(payload.c);
  }
  if (event == 'R') { // Update Rino
    rino.w = payload.w;
    rino.r = payload.r;
  }
  if (event == 'Rj1' && !rino.j) { // Rino wants to start Jump.
    rino.j = 1; // stage 1: back paws still in the ground.
    console.log('Jump Stage', rino.j);
    rinoJumpTimeout = setTimeout(()=> {
      rino.j = 2; // stage 2: rino is going up off ground with 45deg body and head up.
      console.log('Jump Stage', rino.j);
      rinoJumpTimeout = setTimeout(rinoJumpReachedHighestY, 500);
    }, 500);
  }
  if (event == 'Rj0' && rino.j) { // Rino stops the Jump impulse.
    if (rinoJumpTimeout) clearTimeout(rinoJumpTimeout);
    if (rino.j == 2) rinoJumpReachedHighestY(1);
    else rinoIsDropping();
  }
}

/** Jump stage 3: rino is off ground with horizontal body. */
function rinoJumpReachedHighestY(userStopsJump) {
  rino.j = 3;
  console.log('Jump Stage', rino.j);
  rinoJumpTimeout = setTimeout(rinoIsDropping, userStopsJump ? 200 : 500);
}

/** Jump stage 4: rino is dropping off ground with 45deg body and head down. */
function rinoIsDropping() {
  rino.j = 4;
  console.log('Jump Stage', rino.j);
}

function chapterInit(c) {
  rinoVY = 0;
  rinoPawBackLanded = 0;
  rinoPawFrontLanded = 0;
}

let lastTime = performance.now();
let tic = 0;

setInterval(() => {
  tic++;
  /* * * BEGIN FPS * * * * * * * * * * * * * * * * * */
  if (tic%200 == 0) {
    const now = performance.now();
    const fps = 200_000 / (now - lastTime);
    console.log(`Worker FPS: ${fps.toFixed(1)}`);
    lastTime = now;
  }
  /* * * END FPS * * * * * * * * * * * * * * * * * * */
  if (rino.w) {
    rino.x += .07 * rino.r;
  }
  if (rino.j==1) {
    rinoVY -= .01;
  }
  else if (rino.j) {
    rinoVY += .01;
  }
  rino.y += rinoVY;
  postMessage(['E', elements]);
},16);
