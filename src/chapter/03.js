chapters[3] = {
  /** Title */
  t: `And there are dangers.`,
  /** Start */
  s() {
    setTimeout(()=>{
      this.h = { p:1, t:"Rino saw a canyon.\nAnd they can't fly it at once." };
    }, 4000);
    /** History */
    this.h = 0;
    /** Elements */
    this.e = [
      ClassWall( -80,-30, -90, 50, 1, 1),
      mkPlayer(-5,-3,1),
      ClassSign(8,.1, `Fly!`),
      ClassFloor(-30, 10, 0, 10, 1),
      ClassWall( -31, 10, 0.4, 50, 1),

      ClassSign(68,.1, `Believe`),
      ClassFloor(50, 70, 0, 10, 1),
      ClassWall( 50, 70, 0.4, 50, 1),

      ClassFloor(120, 135, 0, 10, 1),
      ClassWall( 120, 135, 0.4, 50, 1),

      ClassSign(167,.1, `Just jump`),
      ClassFloor(155, 170, 0, 10, 1),
      ClassWall( 155, 170, 0.4, 50, 1),

      ClassSign(187,5.1, `Yes,       \nyou can\nfly push.`),
      ClassFloor(175, 190, 5, 10, 1),
      ClassWall( 175, 190, 5.4, 50, 1),

      ClassBox(205, 2, 6,6, 1),
      ClassFloor(200, 210, 5, 10, 1),
      ClassWall( 200, 210, 5.4, 50, 1),

      ClassSign(250,-15, `We're glad\nyou reach\nthis side!`),
      ClassSign(300,-15, `You'll find more\nfurther ahead.`),
      ClassFloor(240, 350, -15, 10, 1),
      ClassWall( 240, 350, -14.6, 50, 1),
    ];
    // Background
    for (let z=2; z<7; z++) {
      for (let x=-rnd(20)-50; x<300+z*20; x+=20+rnd(isFirefox?80:40)) {
        let x2 = x + 20 + rnd(30);
        let y = z**2*-2 + 10 + rnd(z*5);
        this.e.push(ClassFloor(x, x2, y, (y/2)+10, z));
        x = x2;
      }
    }
  },
  T0() {
    if (!flippingPage && rino.x > 295) nextChapter();
    if (rino.x > 240) {
      this.h = { p:0, t:'And they landed safe!\nHowever the journey was not finished.' };
    }
    else if (rino.x > 200) {
      this.h = { p:0, t:'Rino can see the other side of the clif.' };
    }
  },
}
