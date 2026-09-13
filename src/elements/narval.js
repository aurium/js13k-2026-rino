/** Narval data unshared with worker */
let narvalUD = {}

const ClassNarval = (x,y,z=1,C=66)=> {
return {
  K: 'X', // Klass: Extra
  S: 'N', // Species: Rino
  id: 'N',
  x, y, z,
  L: x-8,
  R: x+8,
  T: y-2,
  B: y+2,
  vx: 0,
  vy: 0,
  /** Moving */
  m: 0,
  /** Flip X */
  r: 1,
  /** Rotation Angle */
  // a: 0,
  /** Draw */
  d(tic) {
    let {x, y, r, m, L,R,T,B} = this;

    let rotatePoint = (px,py, dx,dy)=> {
      px *= r;
      let rx = px*cos(a) - py*sin(a);
      let ry = px*sin(a) + py*cos(a);
      return [ dx + rx, dy + ry ];
    }

    // let t = sin( (performance.now() % .5) * oneTurn )/3;

    style(C);

    let T1 = (T*2+y)/3,
        T2 = (T+y*5)/6,
        B1 = (B*2+y)/3,
        B2 = (B+y*2)/3,
        L1 = (L*4+x)/5,
        Rm = (R+x)/2;

    let t = Date.now() % 3000 / 3000;
    let v = sin(t*halfTurn*2); // Wave
    narvalUD.a2 = m ? v/10 : (narvalUD.a2*30 + narvalUD.a)/31;

    ctx.sae();
    ctx.tre(x-camera.x,y-camera.y);
    ctx.rotate(narvalUD.a2);

    let pathBody = new Path2D(
      'M'+[
        // Back
        [-8,0], [-8,-1], [-7,-2], [0,-2],
        // Tail
        [7,-.5], [8,-1], [8,1], [7,.5],
        // Belly
        [0,2], [-7,2], [-8,1],
        // Horn
        [-14,.5], [-8,0]
      ].map(p=>p.map(untZ).join(',')).join('L')
    );
    ctx.fill(pathBody);
    ctx.stroke(pathBody);

    let pathFlipper = new Path2D(
      'M'+[
        [-4,0], [-2.5,1],
        [-3,1.5],
        [-4.5,1.5], [-5.5,.5]
      ].map(p=>p.map(untZ).join(',')).join('L')
    );
    ctx.fill(pathFlipper);
    ctx.stroke(pathFlipper);

    // Eye
    ctx.bePh();
    ctx.ellipse(untZ(-7), 0, untZ(.3), untZ(.3), 0, 0, oneTurn);
    ctx.clPh();
    ctx.fillStyle = '#000';
    ctx.fill();

    // Colision box:
    // style('00F4');
    // ctx.fiRt(-8, -2, 16, 4);

    ctx.ree();
  }
}
}
