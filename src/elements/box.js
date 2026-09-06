// x,y is the center.
const ClassBox = (x,y,w,h,z,c)=> ({
  K: 'O', // Klass: Object
  x, y, w, h,
  vx:0, vy:0,
  z,
  c,
  /** Draw */
  d() {
    let { L, R, T, B } = this;
    style('000', .2, c);
    ctx.Q(L, T, R-L, B-T);
  }
})
