chapters[1] = {
  /** Title */
  t: `I'm not ordinary.`,
  /** Start */
  s() {
    this.e.splice(8, 0, mkPlayer(0,-5,1));
  },
  /** Elements */
  e: [
    ClassBox(-40,-20, 2,2, 1,'F00'),
    ClassBox(  3,  0, 2,2, 1,'0F0'),
    ClassBox(  0,  0, 2,2, 2,'0F0'),
    ClassBox(  0,  0, 2,2, 3,'0F0'),
    ClassBox(  0,  0, 2,2, 4,'0F0'),
    ClassBox(  0,  0, 2,2, 5,'0F0'),
    ClassBox(  0,  0, 2,2, 6,'0F0'),
    ClassBox( 40, 20, 2,2, 1,'00F'),
    ClassFloor(-30, 3, -2, 15, 1),
    ClassFloor(-20, 80,   3, 10, 1),
    ClassWall(-15, -7, -5, 5),
    ClassWall( 15, 25, -5, 5),
    ClassFloor(-20, 20, -20, 10, 3),
    ClassRino(   0,     -43,     4),
    ClassFloor(-20, 20, -40, 10, 4),
    ClassFloor(-20, 20, -60, 10, 5),
    ClassFloor(-20, 20, -80, 10, 6),
  ]
}
