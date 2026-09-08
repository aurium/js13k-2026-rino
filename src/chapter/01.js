chapters[1] = {
  /** Title */
  t: `I'm not ordinary.`,
  /** Start */
  s() {
    /** History */
    this.h = 0;
    /** Elements */
    this.e = [
      ClassFloor(-99, 40, 0, 15, 1),
      ClassSign(15,0, `Don't Jump!`),
      mkPlayer(0,-5,1),
      ClassWall(-99, -40, -99, 0, 1),
      ClassBox(  3,  -2, 4,4, 1,'0F0'),

      ClassFloor(-20, 20, -10, 10, 2),
      ClassRino(-5, -13, 2, 50, 1), // NPC id:1

      ClassFloor(-20, 20, -20, 10, 3),

      ClassFloor(-20, 20, -40, 10, 4),
      ClassRino(-5, -43, 4, 50, 2), // NPC id:2

      ClassFloor(-20, 20, -60, 10, 5),

      ClassFloor(-20, 20, -80, 10, 6),
    ]
  },
  T0(tic) {
    let npc1 = this.e.find(el=>el.id==1);
    if (tic==300) npc1.w = 1;
    if (npc1.x < -13 || npc1.x > 13) npc1.r *= -1;
    worker.postMessage(['UE', transmissibleElements()]); // Notify update elements

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
}
