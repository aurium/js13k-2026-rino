chapters[5] = {
  /** Title */
  t: `The world changes!`,
  /** Start */
  s() {
    let t1="The land is changing!\n",
        t2="The elders said that this happens.\n",
        t3="Rino must be fast."
    setTimeout(()=>{
      this.h = { p:1, t:t1 };
    }, 3000);
    setTimeout(()=>{
      this.h.t = t1+t2;
    }, 5000);
    setTimeout(()=>{
      this.h.t = t1+t2+t3;
    }, 7000);
    /** History */
    this.h = 0;
    /** Elements */
    this.e = [
      mkPlayer(-5,-3,1),
      // mkPlayer(330,-5,1),
      ClassSign(10,.1, `GO!`),
      ClassFloor(-60, 20, 0, 5, 1),
    ];
    // Movable Slabs
    for (let i=1; i<18; i++) {
      this.e.push({ ...ClassFloor(i*20-3, i*20+20, 0, 5), vy:(i%6)/-200 });
      if (i%6==5) {
        this.e.push({ ...ClassWall(i*20-3, i*20+20, .4, 99), vy:(i%6)/-200 });
        this.e.push({ ...ClassSign(
          i*20+4,.1,
          ['That was easy','The air is\ngetting thin.','I always believe\nin you.'][(i-5)/6]
        ), vy:(i%6)/-200 });
      }
    }
    this.e.at(-2).R += 80;
    this.e.at(-3).R += 80;
    // Background
    for (let z=3; z<7; z++) {
      for (let x=-rnd(20)-50; x<380+z*20; x+=20+rnd(isFirefox?80:40)) {
        let x2 = x + 20 + rnd(30);
        let y = z**2*-3 + rnd(z*5);
        this.e.push(ClassFloor(x, x2, y, (y/2)+10, z));
        x = x2;
      }
    }
  },
  T0() {
    if (!flippingPage && rino.x > 380) nextChapter();
    if (rino.x > 345) {
      this.h = { p:1, t:`Happy and perky,\nRino found their path\nthrough the mountains.` };
    }
    else if (rino.x > 220) {
      this.h = { p:0, t:`Wow!\nRino discovered a new cordillera!` };
    }
    else if (rino.x > 100) {
      this.h = { p:0, t:`Rino thought:\n"Maybe that's how mountains are born."\nAnd they are right.` };
    }
  },
}
