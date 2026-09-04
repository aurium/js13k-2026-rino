const ClassRino = (x,y,z,S=[])=> {
/** Instance only data that is not shared with worker */
const unsharedMemory = {
  /** @member {number} ln - the last now(). */
  ln: 0,
  /** @member {number} t - the general animation step, the base index. */
  t: 0
};
return {
  K: 'B', // Klass: Bio Being
  x,y,z,
  /** Style */
  S,
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
  d() {
    let {x, y, r, j, a, w, s} = this

    if (curChapterNum < 99) {
      if (j==1 && abs(a)<limJumpAngle) a -= r*.03;
      if (j==4 && abs(a)<limJumpAngle) a += r*.02;
      if (j==0||j==3) a *= this.pfl ? .6 : .9; // "pfl" means "Paw Front Landed"
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

    style('000', .2, '888');
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

    style(...S);
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
    // Eye
    ctx.C(...rotatePoint(6+t/2, -t), .3, null, S[0]||'000');

    // visible Back Paw
    style(...S);
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
  }
}
}
