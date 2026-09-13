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
  dashEnabled,
  rinoDashEnergy = 0,
  rinoPawBackLanded,
  rinoPawFrontLanded,
  rinoLife = 1,
  elements,
  curChapter,
  chapter5_slabs,
  touchFloorSound = [
    [300, 200, .2, 1], [150, 100, .2, 1], [100, 80, .2, 1]
  ],
  { abs, min, sign } = Math;

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
    log(`New Chapter Event: from:${curChapter} to:${payload.c}`)
    if (!curChapter) { // It is a fresh start.
      rinoLife=1;
      setTimeout(addLife, 1000, 9);
    }
    if (curChapter==99) { // It is a retry!
      setTimeout(addLife, 1000, 5);
    }
    curChapter = payload.c;
    updateElements(payload.e, 1);
    log('Current Chapter:',curChapter);
    chapterInit(payload.c);
  }
  if (event == 'UE') { // Update Elements
    updateElements(payload)
  }
  if (event == 'DE') { rinoDashEnergy = payload } // DEV ONLY

  // Rino can NOT change diretion while jumping (or dropping) or dashing.
  if (event == 'Rgr1' && !rino.D && (!rino.j || rino.r==1)) {
    if (rino.r == -1) rino.x += 2;
    rino.r=1; rino.w=1;
  }
  if (event == 'Rgl1' && !rino.D && (!rino.j || rino.r==-1)) {
    if (rino.r == 1) rino.x -= 2;
    rino.r=-1; rino.w=1;
  }
  if (event == 'Rgr0' && rino.r==1) rino.w=0;
  if (event == 'Rgl0' && rino.r==-1) rino.w=0;

  if (event == 'Rj1' && !rino.D && !rino.j) { // Rino wants to Jump.
    rino.j = 1; // stage 1: back paws still in the ground.
    postMessage(['S',
      [[200, 300, .8, 1], [300, 400, .8, 1]]
    ]);
    log('Jump Stage', rino.j);
    rinoJumpTimeout = setTimeout(()=> {
      rino.j = 2; // stage 2: rino is going up off ground with 45deg body and head up.
      log('Jump Stage', rino.j);
      rinoJumpTimeout = setTimeout(rinoJumpReachedHighestY, 300);
    }, 300);
  }
  if (event == 'Rj0' && !rino.D && rino.j) { // Rino stops the Jump impulse.
    if (rinoJumpTimeout) clearTimeout(rinoJumpTimeout);
    if (rino.j == 2) rinoJumpReachedHighestY(1);
    else rinoIsDropping();
  }

  if (event == 'Rd1' && rinoDashEnergy) { // Rino player wants to Dash.
    clearTimeout(rinoJumpTimeout);
    if (rino.j == 1 || rino.j == 2) { // 45deg dash: hold jump stage 2 while dashing.
      rino.j = 2;
    } else {
      rino.j = 0;
    }
    rino.D = 1;
  }
  if (event == 'Rd0' && rino.D) { // Rino player stops Dash.
    dashEnded();
  }
}

function updateElements(newElementList, updatePlayer) {
  elements = newElementList;
  if (updatePlayer) rino = elements.find(el => el.P); // P==truish identifies the player.
  else elements[elements.findIndex(el => el.P)] = rino;
}

/** Jump stage 3: rino is off ground with horizontal body. */
function rinoJumpReachedHighestY(userStopsJump) {
  rino.j = 3;
  log('Jump Stage', rino.j);
  rinoJumpTimeout = setTimeout(rinoIsDropping, userStopsJump ? 200 : 300);
}

/** Jump stage 4: rino is dropping off ground with 45deg body and head down. */
function rinoIsDropping() {
  rino.j = 4;
  log('Jump Stage', rino.j);
}

/** End the dash; a 45deg dash returns to jump stage 3, then stage 4 naturally. */
function dashEnded() {
  rino.D = 0;
  if (rino.j == 2) { // Was a 45deg dash.
    rinoJumpReachedHighestY();
  }
}

function addLife(num) {
  if (rinoLife<10) rinoLife++;
  if (num>1) setTimeout(addLife, 500, num-1);
}

function chapterInit(c) {
  log('Worker Chapter Init', c)
  rino.vy = 0;
  rinoPawBackLanded = 0;
  rinoPawFrontLanded = 0;

  if (c==1) { // First Chapter
    rinoDashEnergy = -1;
    dashEnabled = 0;
  }

  if (c==5) {
    chapter5_slabs = elements.filter(el => el.vy);
    log('Slabs', chapter5_slabs);
  }
}

/** Each paw of a rino touches some floor or object with the same top value */
function rinoIsGrounded(someRino) {
  let pawBackX = someRino.x - 4 * someRino.r
  let pawFrontX = someRino.x + 2 * someRino.r
  let pawBackLanded = pawFrontLanded = 0;
  for (const el of elements) {
    if (el.z == someRino.z) {
      pawBackLanded ||= (el.K=='F' || el.K=='O') &&
        pawBackX > el.L && pawBackX < el.R &&
        someRino.B >= el.T && someRino.B < el.T+.7;
      pawFrontLanded ||= (el.K=='F' || el.K=='O') &&
        pawFrontX > el.L && pawFrontX < el.R &&
        someRino.B >= el.T && someRino.B < el.T+.7;
    }
    if (pawBackLanded && pawFrontLanded) {
      someRino.y = el.T - 3;
      return 1;
    }
  }
}

function loseLife() {
  if (rinoLife > 0) {
    postMessage([ 'S', [[700, 100, .7, .4]] ]);
    rinoLife--;
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
    log(`Worker FPS: ${fps.toFixed(1)}`);
    lastTime = now;
  }
  /* * * END FPS * * * * * * * * * * * * * * * * * * */

  if (curChapter==5) {
    chapter5_slabs.map(s => {
      s.T += s.vy;
      s.B += s.vy;
    });
  }

  if (tic%10==0 && rino.y > 40) loseLife();

  dashEnabled ||= !(curChapter==1 && (rino.x < 90));
  if (rinoDashEnergy==-1 && dashEnabled) rinoDashEnergy=150;

  if (tic%10==0 && rinoDashEnergy < 150 && dashEnabled) rinoDashEnergy++;

  if (rino.D) { // Dashing
    rino.vx = .56 * rino.r;
    if (rino.j == 2) {
      rino.vx = .4 * rino.r;
      rino.vy = -.4;
    } // 45deg dash: up-forward straight line.
    else rino.vy = 0; // Horizontal dash: straight line, no gravity.
    if (rinoDashEnergy > 0) rinoDashEnergy--;
    else dashEnded();
  }
  else if (rino.w) {
    if (rinoSpeed < 2) rinoSpeed += .005;
  }
  else {
    rinoSpeed = 1;
  }

  /* * * BEGIN colision test and update status and positions * * */
  for (let i=0; e1=elements[i]; i++) if (e1.K=='B' || e1.K=='D' || e1.K=='O') {
    /* * * BEGIN Update Positions * * */
    if (e1.K=='B' && e1.S=='R') { // It is a Rino!
      if (!e1.D) {
        // Compute Jump
        if (e1.j==1) {
          e1.vy -= .017;
        }
        else if (e1.j && e1.vy<.5) {
          e1.vy += .015;
        }
        // Compute Walk
        if (e1.w) {
          e1.vx = .07 * e1.r * ( e1.P ? rinoSpeed : 1 );
        }
        else {
          e1.vx = 0;
        }
      }
      e1.x += e1.vx * ((e1.j&&!e1.D) ? 2 : 1);
      e1.y += e1.vy;
      e1.L = e1.x+e1.r-7;
      e1.R = e1.x+e1.r+7;
      e1.T = e1.y-3;
      e1.B = e1.y+3;
      /** @member {boolean} f - rino in floor = grounded */
      e1.f = !!rinoIsGrounded(e1);
      if (!e1.D) {
        if (e1.vy>0 && e1.f) {
          log('Touch Floor', e1.P, e1.z);
          if (e1.P) postMessage(['S', touchFloorSound]);
          e1.vy = 0;
          e1.j = 0;
        } else {
          // As patas devem tocar o topo de um elemento de chão (K:'F' ou 'O');
          // sem apoio em alguma pata e fora do salto, o rino entra em queda:
          if (!e1.j && !e1.f) {
            log('Drop', e1.P, e1.z);
            e1.j = 4;
            if (e1.P) postMessage(['S',
              [[600, 400, .4, .5], [900, 600, .3, .4]]
            ]);
          }
        }
      }
    }
    let e1IsObjectOrDead = e1.K=='O' || e1.K=='D';
    if (e1.K=='D') { // Update dead beings
      if (e1.h>0) {
        e1.h -= .006;
        e1.y += .003;
      }
    }
    if (e1IsObjectOrDead) { // Update object (and dead) positions
      e1.vx *= .9;
      e1.x += e1.vx;
      e1.y += e1.vy;
      e1.L = e1.x - e1.w/2;
      e1.R = e1.x + e1.w/2;
      e1.T = e1.y - e1.h/2;
      e1.B = e1.y + e1.h/2;
    }
    /* * * END Update Positions * * * */
    // Enforce gravity over objects:
    if (e1IsObjectOrDead && e1.vy<.5) e1.vy += .01;
    // Test pair colisions
    for (let e2 of elements) {
      if (
        e1 != e2 && // There is no self colision.
        e1.z == e2.z && // Is in the same Z layer.
        e1.B >= e2.T && e1.T <= e2.B && // Shares some y.
        e1.L <= e2.R && e1.R >= e2.L // Shares some x.
      ) {
        // Test dropping objects
        if (
          e1IsObjectOrDead && (e2.K=='F' || e2.K=='O') // Obj can be above Floor or Obj.
        ) {
          if (e1.B < (e2.T+.7)) { // It is not too low. Land it.
            // Only objects (not deads) emmits sound on touch floor.
            if (e1.vy>.01 && e1.K=='O') postMessage(['S', touchFloorSound]);
            e1.vy = 0;
            e1.y = e2.T - e1.h/2;
          }
        }
        // Test for horizontal colizions
        if (
          (e1.K!='B' || e2.K!='B') && // Two Bio Being wont colide this way.
          (e1.K=='B' || e1.K=='O') && // Only Alive and objects can colide horizontally
          (e2.K=='W' || e2.K=='O' || e2.K=='B') && // Collidible block types.
          (min( abs(e1.B - e2.T), abs(e1.T - e2.B) ) > .6) // Not stacking one above other.
        ) {
          let inside = min(e2.R-e1.L, e1.R-e2.L);
          let vec = sign(e1.x - e2.x);
          e1.x += (inside * vec + vec)/9;
          if (e1.P && tic%3==0) postMessage(['S',
            [[350, 250, .2, e2.K=='W' ? .5 : .3]]
          ]);
        }
        if (
          (e1.K=='B' && e2.K=='B') && // Two Bio Being colide horizontally
          (e1.P) // The first one is the player
        ) {
          let vec = sign(e1.x - e2.x),
              blodTic = tic%3;
          if (e1.D) { // Player is Dashing, so it can damage and is invulnerable.
            let hornL = e1.x + (e1.r>0 ? 6 : -8);
            let hornR = e1.x + (e1.r>0 ? 8 : -6);
            if (hornL < e2.R && hornR > e2.L) {
              rinoDashEnergy -= 10;
              if (rinoDashEnergy<0) rinoDashEnergy=0;
              if (blodTic) e2.l--;
              if (!e2.l) {
                e2.K = 'D'; // Dead
                e2.w = 12;
                e2.h = 6;
              }
              e1.x += vec;
              e2.x -= vec*2;
            }
          } else { // Player is vulnerable and can't damage.
            let hornL = e2.x + (e2.r>0 ? 6 : -8);
            let hornR = e2.x + (e2.r>0 ? 8 : -6);
            if (hornL < e1.R && hornR > e1.L) {
              if (blodTic) loseLife();
              e1.x += vec/2;
              e2.x -= vec/2;
            }
          }
        }
      }
    }
  }
  /* * * END colision test * * * * * * * * * * * * * * * * * * * */

  // Update elements state to the main thread, allowing canvas update:
  rino.l = rinoLife;
  rino.s = rinoSpeed;
  rino.De = rinoDashEnergy;
  postMessage(['E', { c:curChapter, e:elements }]);
  if (rinoLife == 0) postMessage(['NC', 99]);
}

setInterval(loopInteration ,16);

export const __rinoIsGrounded = rinoIsGrounded
export const __loopInteration = loopInteration
