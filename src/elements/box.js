// x,y is the center.
const ClassBox = (x,y,w,h,z=1,c=60)=> ({
  K: 'O', // Klass: Object
  x, y, w, h,
  vx:0, vy:0,
  z,
  c,
  /** Draw */
  d() {
    let { x, y, L, R, T, B } = this;
    style(c);
    ctx.Q(L, T, R-L, B-T);
    let m = (w+h)/20;
    let path = mkPath( L+m,T+m*2, x-m,y, L+m,B-m*2, 'z' );
    path.addPath(mkPath( R-m,T+m*2, x+m,y, R-m,B-m*2, 'z' ));
    path.addPath(mkPath( L+m*2,T+m, x,y-m, R-m*2,T+m, 'z' ));
    path.addPath(mkPath( L+m*2,B-m, x,y+m, R-m*2,B-m, 'z' ));
    style(c*.8);
    ctx.fill(path);
    ctx.stroke(path);
  }
})
