const ClassBox = (cx,cy,w,h,z,c)=> ({
  K: 'O', // Klass: Object
  L: cx - w/2,
  R: cx + w/2,
  T: cy - h/2,
  B: cy + h/2,
  z,c,
  /** Draw */
  d() {
    let { L, R, T, B } = this;
    style('000', .2, c);
    ctx.Q(L, T, R-L, B-T);
  }
})
