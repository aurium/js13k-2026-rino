let dieScale, dieRotate, dieRotateLimit, dieIncMult;

chapters[99] = {
  /** Title */
  t: `Rino dies.`,
  /** Start */
  s() {
    curMelody = deadMelody;
    dieScale = 1, dieRotate = 0, dieRotateLimit = 0, dieIncMult = 0;
    let r = mkPlayer(0,0,1);
    r.a = -limJumpAngle*.75;
    /** Elements */
    this.e = [r];
    setTimeout(()=> {
      dieRotateLimit = oneTurn*1.28;
    }, 3000);
  },
  T1(z) {
    camera = { x: 0, y: 0 };
    if (z>1) return;
    if (dieRotate < dieRotateLimit) {
      if (dieIncMult < 1) dieIncMult += 0.001;
    } else {
      dieIncMult *= .995;
    }
    dieRotate += 0.01*dieIncMult;
    dieScale += 0.001*dieIncMult;
    ctx.sae();
    ctx.scale(dieScale, dieScale);
    ctx.rotate(dieRotate);
    ctx.C(0,0,dieScale*3, 'C00');
    ctx.C(4,-2,dieScale*2, 'C00');
  },
  T2(z) {
    if (z>1) return;
    ctx.C(2,-3.9,dieScale*.7, 'C00');
    ctx.ree();
  }
}
