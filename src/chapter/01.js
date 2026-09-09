chapters[1] = {
  /** Title */
  t: `I'm not ordinary.`,
  /** Start */
  s() {
    /** History */
    this.h = 0;
    /** Elements */
    this.e = [
      mkPlayer(0,-5,1),
      ClassFloor(-99,  70,   0, 15, 1),
      ClassWall(  37,  42,   4,  8,   1, 1),
      ClassWall(  39,  45,   2,  8.1, 1, 1),
      ClassFloor( 35, 350,   8, 15, 1),
      ClassSign(  99,8, `Find Happiness`),
      ClassSign( 160,8, `This is our land`),
      ClassWall( 175, 190,  -5,  8.1, 1, 1),
      ClassWall( 180, 200, -15,  8,   1, 1),
      ClassWall( 195, 205,  -2,  8.1, 1, 1),
      ClassSign( 230,8, `R u leaving?`),
      ClassSign( 290,8, `Good Look!`),
      ClassWall( -99, -40, -99,  0, 1),
      // ClassBox(15,-2, 5,5),
      // ClassBox(15,-20, 8,8,1,70),
      // ClassBox(15,-30, 8,4,1,80),

      ClassFloor(-40, 20, -10, 10, 2),
      ClassRino(-25, -13, 2, 60, 1), // NPC id:1

      ClassFloor(25, 80,   0, 10, 2),
      ClassWall( 30, 40,  -5,  0, 2, 1),
      ClassWall( 45, 60, -10,  0, 2, 1),
      ClassWall( 70, 76,  -6,  0, 2, 1),
      ClassSign(74,-6, `Caution!`, 2),

      ClassFloor(-20, 10, -25, 0, 3),
      ClassFloor( 20, 40, -18, 0, 3),
      ClassFloor( 48, 85, -22, 0, 3),
      ClassRino(60, -25, 3, 70, 2), // NPC id:2

      ClassFloor(-20, 40, -40, -25, 4),
      ClassRino(-4, -300, 4),
      {...ClassRino(15, -43, 4, 50), r:-1},
      ClassFloor( 80, 99, -44, -10, 4),

      ClassFloor(60, 100, -65, -40, 5),

      ClassFloor(15, 50, -85, -65, 6),
    ];
    for (let z=2; z<6; z++) {
      for (let x=90+z*3+Math.random()*10; x<270; x+=10+Math.random()*15) {
        let x2 = x + 20 + Math.random()*20;
        let y = -((1-z)**2)*5+4 + Math.random()*z*2;
        this.e.push(ClassFloor(x, x2, y, (y/2)+10, z));
        if (Math.random()<.05) this.e.push(ClassRino((x+x2)/2, y-3, z));
        x = x2;
      }
    }
  },
  T0(tic) {
    let npc1 = this.e.find(el=>el.id==1);
    if (tic>200) npc1.w = 1;
    if (npc1.x < -30) npc1.r = 1;
    if (npc1.x > 13) npc1.r = -1;

    let npc2 = this.e.find(el=>el.id==2);
    if (rino.x > 60 && !npc2.j) {
      npc2.w = rino.w;
      npc2.r = rino.r;
    } else npc2.w = 0;

    if (!flippingPage && rino.x > 300) nextChapter();

    if (tic%20==0) worker.postMessage(['UE', transmissibleElements()]); // Notify update elements

    if (rino.x > 15 && rino.x < 35) {
      this.h = { p:1, t:'Rino knows they can walk\nwith ← → keys.' };
    }
    else if (rino.x > 50 && rino.x < 75) {
      this.h = { p:0, t:'Rino also knows the key ↑\nmakes they to jump.' };
    }
    else if (rino.x > 90 && rino.x < 115) {
      this.h = { p:1, t:'Now Rino feels they can\nsuperspeed pressing spacebar!' };
    }
    else if (rino.x > 140 && rino.x < 170) {
      this.h = { p:0, t:'Rino can also\njump + superspeed\nto fly like a roket!' };
    }
    else {
      this.h = 0;
    }
  },
}
