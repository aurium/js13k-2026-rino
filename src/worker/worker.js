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
  rinoSpeed = 1,
  rinoPawBackLanded,
  rinoPawFrontLanded,
  elements,
  rinoLife = 1;

/**
 * Listen for events from main thread.
 * Event names:
 * - `NC` means "New Chapter" (The player enters a new game level).
 * - `Rgr1` means "Rino player wants to go right".
 * - `Rgr0` means "Rino player does not want to go right".
 * - `Rgl1` and `Rgl0` are the same as `Rgr#`, but to the left.
 * - `Rj1` means "Rino player wants to Jump and is giving impulse".
 * - `Rj0` means "Rino player stops the Jump impulse".
 */
self.onmessage = ({data: [event, payload]})=> {
  if (event == 'NC') { // New Chapter
    elements = payload.e;
    rino = elements.find(el => el.P); // P==truish identifies the player.
    console.log('Current Chapter:',payload.c);
    console.log('Elements:',payload.e);
    chapterInit(payload.c);
  }

  // Rino can NOT change diretion while jumping (or dropping).
  if (event == 'Rgr1' && (!rino.j || rino.r==1)) {
    if (rino.r == -1) rino.x += 2;
    rino.r=1; rino.w=1;
  }
  if (event == 'Rgl1' && (!rino.j || rino.r==-1)) {
    if (rino.r == 1) rino.x -= 2;
    rino.r=-1; rino.w=1;
  }
  if (event == 'Rgr0' && rino.r==1) rino.w=0;
  if (event == 'Rgl0' && rino.r==-1) rino.w=0;

  if (event == 'Rj1' && !rino.j) { // Rino wants to Jump.
    rino.j = 1; // stage 1: back paws still in the ground.
    console.log('Jump Stage', rino.j);
    rinoJumpTimeout = setTimeout(()=> {
      rino.j = 2; // stage 2: rino is going up off ground with 45deg body and head up.
      console.log('Jump Stage', rino.j);
      rinoJumpTimeout = setTimeout(rinoJumpReachedHighestY, 300);
    }, 300);
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
  rinoJumpTimeout = setTimeout(rinoIsDropping, userStopsJump ? 200 : 300);
}

/** Jump stage 4: rino is dropping off ground with 45deg body and head down. */
function rinoIsDropping() {
  rino.j = 4;
  console.log('Jump Stage', rino.j);
}

function chapterInit(c) {
  rino.vy = 0;
  rinoPawBackLanded = 0;
  rinoPawFrontLanded = 0;
  if (c==1) { // First Chapter
    rinoLife = 1;
    for (let i=5; i<14; i++) setTimeout(()=> rinoLife++, i*300);
  }
}

/** Each paw of a rino touches some floor or object with the same top value */
function rinoIsGrounded(someRino) {
  let pawBackX = someRino.x - 4 * someRino.r
  let pawFrontX = someRino.x + 2 * someRino.r
  let pawBackLanded = pawFrontLanded = 0;
  for (const el of elements) {
    if (el.z == rino.z) {
      pawBackLanded ||= (el.K=='F' || el.K=='O') &&
        pawBackX > el.L && pawBackX < el.R &&
        someRino.B >= el.T && someRino.B < el.T+.7;
      pawFrontLanded ||= (el.K=='F' || el.K=='O') &&
        pawFrontX > el.L && pawFrontX < el.R &&
        someRino.B >= el.T && someRino.B < el.T+.7;
    }
  }
  return pawBackLanded && pawFrontLanded;
}

function testColisionFloor(o1, o2) {
  for (const el of elements) {
    if (o1.z == o2.z && (o2.K=='F' || o2.K=='O')) {
      o1.R > o2.L && o1.L < el.R &&
      o1.B >= o2.T && o1.B < o2.T+.7;
    }
  }
}

let lastTime = performance.now();
let tic = 0;

function loopInteration() {
  if (!elements || !rino || rinoLife==0) return;
  tic++;
  /* * * BEGIN FPS * * * * * * * * * * * * * * * * * */
  if (tic%200 == 0) {
    const now = performance.now();
    const fps = 200_000 / (now - lastTime);
    console.log(`Worker FPS: ${fps.toFixed(1)}`);
    lastTime = now;
  }
  /* * * END FPS * * * * * * * * * * * * * * * * * * */

  if (tic%10==0 && rino.y > 30 && rinoLife > 0) rinoLife--;

  if (rino.w) {
    if (rinoSpeed < 2) rinoSpeed += .005;
    rino.vx = .07 * rino.r * rinoSpeed;
    rino.x += rino.vx;
  }
  else {
    rinoSpeed = 1;
    rino.vx = 0;
  }

  if (rino.j==1) {
    rino.vy -= .02;
  }
  else if (rino.j && rino.vy<.5) {
    rino.vy += .015;
  }

  /* * * BEGIN Update Positions * * */
  rino.y += rino.vy;
  rino.L = rino.x+rino.r-7;
  rino.R = rino.x+rino.r+7;
  rino.T = rino.y-3;
  rino.B = rino.y+3;
  /* * * END Update Positions * * * */

  /* * * BEGIN colision test and update status and positions * * */
  /** @member {boolean} f - rino in foor = grounded */
  rino.f = !!rinoIsGrounded(rino);
  if (rino.vy > 0 && rino.f) {
    rino.vy = 0;
    console.log('CHÃO')
    rino.j = 0;
  } else {
    // As patas devem tocar o topo de um elemento de chão (K:'F' ou 'O');
    // sem apoio em alguma pata e fora do salto, o rino entra em queda:
    if (!rino.j && !rino.f) rino.j = 4;
  }

  /* * * BEGIN Test horizontal colisions * * */
  for (let i=0; e1=elements[i]; i++) if (e1.K=='B' || e1.K=='O') {
    for (let e2 of elements) {
      if (
        e1 != e2 && // There is no self colision.
        e1.z == e2.z && // Is in the same Z layer.
        (e1.K != 'B' || e2.K != 'B' ) && // Two Bio Being wont colide this way.
        (e2.K=='W' || e2.K=='O' || e2.K=='B') && // Collidible types.
        e1.B > e2.T && e1.T < e2.B && // Shares some y.
        e1.L < e2.R && e1.R > e2.L // Shares some x.
      ) {
        let inside = Math.min(e2.R-e1.L, e1.R-e2.L);
        let vec = Math.sign(e1.x - e2.x);
        e1.x += (inside * vec + vec)/9;
      }
    }
    if (e1.K == 'O') { // Update object klass
      e1.L = e1.x - e1.w/2;
      e1.R = e1.x + e1.w/2;
      e1.T = e1.y - e1.h/2;
      e1.B = e1.y + e1.h/2;
    }
  }
  /* * * END Test horizontal colisions * * * */

  /* * * END colision test * * * * * * * * * * * * * * * * * * * */

  // Update elements state to the main thread, allowing canvas update:
  rino.l = rinoLife;
  rino.s = rinoSpeed;
  postMessage(['E', elements]);
  if (rinoLife == 0) postMessage(['NC', 99]);
}

setInterval(loopInteration ,16);

export const __rinoIsGrounded = rinoIsGrounded
export const __loopInteration = loopInteration
export const __testColisionFloor = testColisionFloor
