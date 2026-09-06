chapters[1] = {
  /** Title */
  t: `I'm not ordinary.`,
  /** Start */
  s() {
    this.e.push(mkPlayer(0,-5,1));
  },
  T0() {
    if (rino.x > 20) {
      this.h = { p:0, t:'Rino also knows the key ↑\nmakes they to jump.' };
    }
    else if (rino.x > 15) {
      this.h = 0;
    }
    else if (rino.x > 8) {
      this.h = { p:1, t:'Rino knows they can walk\nwith ← → keys.' };
    }
  },
  /** Elements */
  e: [
    ClassBox(-40,-20, 2,2, 1,'F00'),
    ClassBox(  3,  0, 4,4, 1,'0F0'),
    ClassBox(  0,  0, 2,2, 2,'0F0'),
    ClassBox(  0,  0, 2,2, 3,'0F0'),
    ClassBox(  0,  0, 2,2, 4,'0F0'),
    ClassBox(  0,  0, 2,2, 5,'0F0'),
    ClassBox(  0,  0, 2,2, 6,'0F0'),
    ClassBox( 40, 20, 2,2, 1,'00F'),
    ClassSign(15,3, `Don't Jump!`),
    ClassFloor(-30, 3, -2, 15, 1),
    ClassFloor(-20, 25,  3, 10, 1),
    ClassFloor( 15, 40, 15, 20, 1),
    ClassWall(-15, -7, -5, 3, 1, 1),
    ClassWall( 15, 25,  3.2, 15),
    ClassFloor(-20, 20, -20, 10, 3),
    ClassRino(   0,     -43,     4),
    ClassFloor(-20, 20, -40, 10, 4),
    ClassFloor(-20, 20, -60, 10, 5),
    ClassFloor(-20, 20, -80, 10, 6),
  ]
}
