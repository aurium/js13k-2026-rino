postMessage(['A']);

/*
  rino type is:
  {
    K: Klass ('B' = Bio Being)
    x: Horizontal center position (lower=left bigger=rigth)
    y: Vertical center position (lower=up bigger=down)
    z: Z level (like CSS z-index)
    w: Walking (1=trueish 0=falseish)
    j: Jumping (stages: 1, 2, 3, and 4) (0 = not jumping)
    r: Flip X (1=to the rigth -1=to the left)
  }
*/

/*
  elements is an array of:
  {
    K: Klass ('T' = Terrain, 'O' = Object)
    L: Left (lower horizontal position)
    R: Right (bigger horizontal position)
    T: Top (lower vertical position)
    B: Bottom (bigger vertical position)
    z: Z level (like CSS z-index)
  }
  the rino itself and other `{k:'B'}` are in te elements array too.
*/

let rino,
  rinoJumpTimeout,
  rinoVY,
  rinoPawBackLanded,
  rinoPawFrontLanded,
  elements

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

/** Top (T) of the highest surface supporting a paw, or null when it has no ground under it. */
function groundTopFor(pawX, pawY) {
  for (const el of elements) {
    if (el.z == rino.z) {
      if ((el.K=='T' || el.K=='O') &&
          pawX > el.L && pawX < el.R &&
          pawY >= el.T && pawY <= el.B) {
        return el.T;
      }
    }
  }
  return null;
}

let lastTime = performance.now();
let tic = 0;

function loopInteration() {
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

  /* * * BEGIN Update Positions * * */
  rino.y += rinoVY;
  /* * * END Update Positions * * * */

  /* * * BEGIN colision test and update status and positions * * */
  let rinoPawBackX = rino.x - 4 * rino.r
  let rinoPawBackY = rino.y + 3
  let rinoPawFrontX = rino.x + 2 * rino.r
  let rinoPawFrontY = rino.y + 3
  const groundBackY = groundTopFor(rinoPawBackX, rinoPawBackY);
  const groundFrontY = groundTopFor(rinoPawFrontX, rinoPawFrontY);
  // pouso: somente caindo (vy>0; no ápice do salto vy é 0) e com as duas patas
  // sobre o topo de um elemento, o rino apoia sem atravessá-lo:
  if (rinoVY > 0 && groundBackY != null && groundFrontY != null) {
    rino.y = Math.min(rino.y, Math.min(groundBackY, groundFrontY) - 3);
    rinoVY = 0;
    rino.j = 0;
    rinoPawBackLanded = 1;
    rinoPawFrontLanded = 1;
  } else {
    // apoio: as patas devem tocar o topo de um elemento de chão (K:'T' ou
    // 'O'); sem apoio em alguma pata e fora do salto, o rino entra em queda:
    rinoPawBackLanded = groundBackY != null;
    rinoPawFrontLanded = groundFrontY != null;
    if (!(rino.j==1 || rino.j==2 || rino.j==3) &&
        (groundBackY == null || groundFrontY == null)) {
      rino.j = 4;
    }
  }
  /* * * END colision test * * * * * * * * * * * * * * * * * * * */

  // Update elements state to the main thread, allowing canvas update:
  postMessage(['E', elements]);
}

setInterval(loopInteration ,16);

export const __loopInteration = loopInteration
export const __groundTopFor = groundTopFor
