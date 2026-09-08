// x,y is the flor poin to fix.
const ClassSign = (x,y,text,z=1)=> ({
  K: 'S', // Klass: Sign
  B: y,
  L: x-2,
  R: x+2,
  z,
  /** Draw */
  d() {
    style();
    ctx.textAlign = 'center';
    ctx.font = `bold ${unt}px sans-serif`;
    let w = ctx.measureText(text).width / unt + 1;
    ctx.sae();
    ctx.tre(x-camera.x,y-camera.y);
    ctx.rotate(.2);
    ctx.fiRt(-.3, -2, .6, 2.2);
    ctx.stRt(-.3, -2, .6, 2.2);
    ctx.fiRt(-w/2, -4, w, 2);
    ctx.stRt(-w/2, -4, w, 2);
    ctx.fillStyle = '#000';
    ctx.fiTt(text, 0, -2.7);
    ctx.ree();
  }
})
