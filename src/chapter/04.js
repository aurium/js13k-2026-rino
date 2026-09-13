chapters[4] = {
  /** Title */
  t: `Other rhinoceros.`,
  /** Start */
  s() {
    let t1="Rino found new friends!\n",
        t2="Maybe he doesn't feel so alone now.\n",
        t3="...Or worse?"
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
      ClassSign(35,.1, `Land of\nRednoceros`),
      ClassSign(150,.1, `U r NOT\nwelcome`),
      ClassSign(200,.1, `still our land`),
      ClassSign(250,.1, `Get lost!`),
      ClassSign(345,.1, `Borderland\nof\nRednoceros`),
      ClassRino(100,-3,1,75,1), // NPC 1
      ClassRino(200,-3,1,20,2), // NPC 2
      ClassRino(250,-3,1,80,3), // NPC 3
      ClassRino(330,-3,1,40,4), // NPC 4
      mkPlayer(-5,-3,1),

      ClassBox(40,-10,4,4),
      ClassBox(41,-20,4,4),
      ClassBox(40,-30,4,4),
      ClassBox(41,-40,4,4),
      ClassBox(40,-50,4,4),

      ClassBox(350, -2,4,4),
      ClassBox(351, -6,4,4),
      ClassBox(350,-10,4,4),
      ClassBox(351,-14,4,4),
      ClassBox(350,-18,4,4),

      ClassFloor(-60, 450, 0, 5, 1),
    ];
  },
  T0() {
    let npcs = this.e.filter(el=> el.id>0);
    npcs.map(npc=> {
      if (npc.l > 0) {
        // Follow Player or run away when damaged:
        npc.r = sign(rino.x - npc.x) * (npc.l>4 ? 1 : -1);
        npc.w = (rino.x > (npc.id*80-20)) ? 1 : 0;
      }
    });
    if (tic%20==0) worker.postMessage(['UE', transmissibleElements()]);

    if (!flippingPage && rino.x > 370) nextChapter();
    if (rino.x > 60) {
      this.h = { p:1, t:`Ups...\nIt is clear that they are not friendly.\nOnly the Rhino's superpower will overcome their aggressiveness.` };
    }
  },
}
