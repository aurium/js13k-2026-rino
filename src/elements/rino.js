const ClassRino = (x,y,z,C=66,id)=> {
/** Instance only data that is not shared with worker */
const unsharedMemory = {
  /** @member {number} ln - the last now(). */
  ln: 0,
  /** @member {number} t - the general animation step, the base index. */
  t: 0,
};
return {
  K: 'B', // Klass: Bio Being
  S: 'R', // Species: Rino
  id,
  x, y, z,
  L: x-6,
  R: x+8,
  vx: 0,
  vy: 0,
  /** Walking */
  w: 0,
  /** Speed Multiplier */
  s: 1,
  /** Jumping */
  j: 0,
  /** Flip X */
  r: 1,
  /** Rotation Angle */
  a: 0,
  /** Draw */
  d(tic) {
    let {x, y, r, j, a, w, s, D,G, L,R,T,B} = this;

    if (curChapterNum < 99) {
      if (j==1 && abs(a)<limJumpAngle) a -= r*.03;
      if (j==4 && abs(a)<limJumpAngle) a += r*.02;
      if (j==0||j==3) a *= this.f ? .6 : .9; // "f" means "Rino touches Floor".
      this.a = a;
    }

    let rotatePoint = (px, py)=> {
      px *= r;
      let rx = px*cos(a) - py*sin(a);
      let ry = px*sin(a) + py*cos(a);
      return [ x + rx, y + ry ];
    }
    let mvPoint = (px, py, inc=0)=> {
      let px2 = (px-2) * r;
      px *= r;
      let ry2 = px2*sin(a) + py*cos(a);
      let ry = px*sin(a) + py*cos(a);
      if (inc) ry = (ry+ry2*inc)/(inc+1);
      return [ x + px, y + ry ];
    }

    //// BEGIN Animation step base index //////////////////////////////////
    const now = performance.now();
    const dt = (now - unsharedMemory.ln) / 1000;
    unsharedMemory.ln = now;
    unsharedMemory.t = (unsharedMemory.t + dt * s) % 1;
    //// END Animation step base index ////////////////////////////////////

    let paw = (place, offset)=> {
      let t = (unsharedMemory.t + offset) % 1;

      if (!w) t=.25;
      if (t<.5) {
        return [
          ...mvPoint(place+.5-t*2,  1),
          ...mvPoint(place+1-t*4,   3),
          ...mvPoint(place+3-t*4,   3, 2),
          ...mvPoint(place+2.5-t*2, 1, 1)
        ]
      } else {
        t = (1-t)*2;
        let incY = sin(halfTurn*t);
        return [
          ...mvPoint(place+.5-t**4,  1-incY/2),
          ...mvPoint(place+1-t*2,    3-incY),
          ...mvPoint(place+3-t*2,    3-incY, 2),
          ...mvPoint(place+2.5-t**4, 1-incY/2, 1)
        ]
      }
    }

    let t = sin( (unsharedMemory.t % .5) * oneTurn )/3;
    if (!w) t=0;

    // DASH!
    if (this.P) {
      if (D) {
        if (!dashing) {
          log('Starting DASH')
          dashSoundFinish = [
            playSound(100, 700, 4),
            playSound(300, 800, 4)
          ]
          dashing = 1;
        }
        // ['F00', 'F70', 'FE0', '0E0', '0AF', 'A4F'].map((color, dashY)=> {
        [0, 30, 60, 120, 200, 280].map((color, dashY)=> {
          let openY = (dashY-3)/100+rnd(.01);
          rainbow.push({
            ...((j==1||j==2) ? {
              x: x-5.5*rino.r,  y: y+dashY/2,
              vx: -.15*rino.r+(dashY-3)/100*rino.r, vy:.15+openY,
            } : {
              x: x-5*rino.r + rnd()-.5,  y: y-2+dashY/2,
              vx: -.2*rino.r, vy: openY,
            }),
            r: .2+rnd(.333),
            c: `hsl(${color} 100 ${35+rnd(30)})`,
            t:0
          });
        });
      } else if (dashing) {
        log('Stoping DASH')
        dashSoundFinish.map(fn => fn())
        dashing = 0;
      }
    }

    style(C*.8);
    // hiden Back Paw
    let path = mkPath(
      ...rotatePoint(-6,-1), ...paw(-6,0), ...rotatePoint(-3.5,-1)
    );
    ctx.fill(path);
    ctx.stroke(path);
    // hiden Front Paw
    path = mkPath(
      ...rotatePoint(1,-1), ...paw(+2,.5), ...rotatePoint(4,-1)
    );
    ctx.fill(path);
    ctx.stroke(path);

    style(...(C.at ? C : [C]));
    // Trunk
    path = mkPath(
      // Back
      ...rotatePoint(-6,-3), ...rotatePoint(4.5,-3), ...rotatePoint(6,-2),
      // Belly
      ...rotatePoint(4,+2), ...rotatePoint(-2,+2), ...rotatePoint(-6,-1),
      // Tail
      ...rotatePoint(-6,-2.7), ...rotatePoint(-7-t,-1-t), 'z'
    );
    ctx.fill(path);
    ctx.stroke(path);

    // Head
    path = mkPath(
      ...rotatePoint(4.5,-3), ...rotatePoint(6,-2-t/2), ...rotatePoint(7+t/2,-t),
      // Horn
      ...rotatePoint(9+t/2,-1-t), ...rotatePoint(7.5+t/2,+1-t),
      ...rotatePoint(8+t/2,+2-t),
      ...rotatePoint(6.5+t/2,+3-t), ...rotatePoint(4.5+t/4,+1-t), ...rotatePoint(4.5,-.3-t/2)
    );
    ctx.fill(path);
    ctx.stroke(path);

    // visible Back Paw
    path = mkPath(
      ...rotatePoint(-6,-1), ...paw(-6,.5), ...rotatePoint(-3,-1)
    );
    ctx.fill(path);
    ctx.stroke(path);
    // visible Front Paw
    path = mkPath(
      ...rotatePoint(1.5,-.5), ...paw(+2,0), ...rotatePoint(4,-.5)
    );
    ctx.fill(path);
    ctx.stroke(path);

    // Eye
    ctx.C(...rotatePoint(6+t/2, -t), .3, C.at ? C[1] : '000');

    // Colision box:
    // style('00F4', '0F08', .2);
    // ctx.Q(L, T, R-L, B-T);
  }
}
}
