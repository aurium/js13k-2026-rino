const ClassRino = (x,y,z,S=[])=> ({
  K: 'B', // Klass: Bio Being
  x,y,z,
  /** Style */
  S,
  /** Walking */
  w: 0,
  /** Jumping */
  j: 0,
  /** Flip X */
  r: 1,
  /** Rotation Angle */
  a: 0,
  /** Draw */
  d() {
    const {x, y, r, a, w} = this
    // let rotateX = ()=> x*Math.cos(a) - y*Math.sin(a);
    // let rotateY = ()=> x*Math.sin(a) + y*Math.cos(a);
    let flipX = n => x + n*r;
    // let placeY = n => y + rotateY(n);
    let placeY = n => y + n
    let rotatePoint = (px, py)=> {
      px *= r;
      let rx = px*Math.cos(a) - py*Math.sin(a);
      let ry = px*Math.sin(a) + py*Math.cos(a);
      return [ x + rx, y + ry ];
    }

    let paw = (place, offset)=> {
      let t = (Date.now() + offset*1000) % 1000 / 1000;
      if (!w) t=.25;
      if (t<.5) {
        return [
          ...rotatePoint(place+.5-t*2,  1),
          ...rotatePoint(place+1-t*4,   3),
          ...rotatePoint(place+3-t*4,   3),
          ...rotatePoint(place+2.5-t*2, 1)
        ]
      } else {
        t = (1-t)*2;
        let incY = Math.sin(Math.PI*t);
        return [
          ...rotatePoint(place+.5-t**4,  1-incY/2),
          ...rotatePoint(place+1-t*2,    3-incY),
          ...rotatePoint(place+3-t*2,    3-incY),
          ...rotatePoint(place+2.5-t**4, 1-incY/2)
        ]
      }
    }

    let t = Math.sin( Math.PI * (Date.now() % 500 / 500) )/3;
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
})
