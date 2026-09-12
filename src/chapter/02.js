chapters[2] = {
  /** Title */
  t: `There are things!`,
  /** Start */
  s() {
    let t1 = "Rino saw a box.\n",
        t2 = "And they can push it!\n",
        t3 = "Maybe they can climb it..."
    setTimeout(()=>{
      this.h = { p:1, t:t1 };
    }, 3000);
    setTimeout(()=>{
      this.h.t = t1+t2;
    }, 5000);
    setTimeout(()=>{
      this.h.t = t1+t2+t3;
      this.h2 = 1; // Enable continue by position.
    }, 7000);
    /** History */
    this.h = 0;
    /** Elements */
    this.e = [
      mkPlayer(0,-5,1),
      ClassBox(12,-4, 4,4, 1, 60),
      ClassBox(17, 1, 6,4, 1, 65),
      ClassBox(30,-100, 4,4, 1, 70),

      ClassFloor(-20, 15, -2, 3, 1),
      ClassFloor(-45, 70,  3, 8, 1),
      ClassSign(-40,3, `Don't Jump!`),

      ClassWall(36,39, 0,3, 1, 1),
      ClassSign(10,3.1, `Push it →`),
      ClassSign(37,0, `Climb the boxes.\nFly higher!`),
      ClassSign(46,3, `Gather all\nyour strength.`),
      ClassSign(55,3, `↑\nThe exit\nis above.`),

      ClassFloor(150, 250, -76, -60, 1),
      ClassSign(210, -76, `U r terrific!`),
    ];
    for (let z=2; z<7; z++) {
      for (let x=z*10-rnd(20)-50; x<250; x+=20+rnd(40)) {
        let x2 = x + 10 + rnd(20);
        let y = z**2*-3 + rnd(z*5);
        this.e.push(ClassFloor(x, x2, y, (y/2)+10, z));
        x = x2;
      }
    }
  },
  T0() {
    if (this.h2) {
      if (rino.x > 20) {
        this.h = { p:0, t:'Rino thinks they can touch the sky\nif they start the flight on tiptoe.' };
        this.h3 = 1
      }
      else if (this.h3) this.h = 0;
      if (rino.y < -78) {
        this.h = { p:1, t:'...and they was right!' };
        if (!flippingPage && rino.x > 200) nextChapter();
      }
    }
  },
}
