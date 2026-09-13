chapters[6] = {
  /** Title */
  t: `There are no rules.`,
  /** Start */
  s() {
    let t1="Rino came down from the mountains.\n",
        t2="They found the ocean,\n",
        t3="and a Narwhal."
    setTimeout(()=> this.h = { p:1, t:t1 }, 3000);
    setTimeout(()=> this.h.t = t1+t2, 5000);
    setTimeout(()=> this.h.t = t1+t2+t3, 7000);
    /** History */
    this.h = 0;
    /** Elements */
    this.e = [
      mkPlayer(-5,-3,1),
      // mkPlayer(45,-3,1),
      ClassSign(30,.1, `Ocean →`),
      ClassFloor(-70, 50, 0, 5, 1),
      ClassWall(-70,-20, -90,0, 1, 1),
      ClassWater(50,150, 0,8),
      ClassNarval(110,5)
    ];
    // Background
    for (let z=3; z<7; z++) {
      for (let x1=-rnd(20)-50; x1<200; x1+=20+rnd(isFirefox?80:40)) {
        let x2 = x1 + 20 + rnd(30);
        let y = z**2*-3 + rnd(z*5);
        this.e.push(ClassFloor(x1, x2, y, (y/2)+10, z));
        x1 = x2;
      }
    }
  },
  T0() {
    if (rino.x>=45) {
      inputDisabled = 1;
      setTimeout(()=> {
        getCamTargetX = ()=> elements.find(e=> e.S=='N').x;
      }, 1500);
      let narval = elements.find(e=> e.S=='N');
      narvalUD.a = halfTurn * .3;
      if (narval.x == 65) {
        theEndAniStep2(this);
        this.T0 = ()=>0;
      }
    }
  },
}

function theEndAniStep3(tic) {
  if (theEndAniStep3.ta < 255 && tic%5==0) theEndAniStep3.ta++;
  ctx.fillStyle = '#DD0000'+theEndAniStep3.ta.toString(16);
  ctx.textAlign = 'right';
  ctx.font = `bold ${7*unt}px cursive`;
  if (theEndAniStep3.ty < 15) theEndAniStep3.ty += .015;
  ctx.fillText(`The End ♥`, 75*unt, theEndAniStep3.ty*unt);
  // elements.map((el, i)=> {
  //   if (el.K == 'F') {
  //     el.C = [
  //       `hsl(${(i*973)%360} 100 40)`,
  //       `hsl(${(i*973)%360} 100 50)`,
  //       `hsl(${(i*973)%360} 100 80/0)`
  //     ]
  //   }
  // });
  // elements.find(el=>el.K=='W').C = [
  //   `hsl(220 100 60)`,
  //   `hsl(220 100 60/0)`,
  // ]
  // if (tic%20==0) worker.postMessage(['UE', transmissibleElements()]);
}
theEndAniStep3.ta = 20;
theEndAniStep3.ty = 0;

function theEndAniStep2(chapter) {
  let t1 = "— “Who are you?” asked Rino.\n",
      t2 = "— “I'm a unicorn, like you.” answered the narwhal.\n",
      t3 = "— “I love you.” Rino declared.\n",
      t4 = "— “I know.” replyed the narwhal."
  setTimeout(()=> chapter.h = { p:0, t:t1 }, 2000);
  setTimeout(()=> chapter.h.t = t1+t2, 4000);
  setTimeout(()=> chapter.h.t = t1+t2+t3, 6000);
  setTimeout(()=> chapter.h.t = t1+t2+t3+t4, 8000);
  setTimeout(()=> chapter.T3 = theEndAniStep3, 5000);
  // clearColor = '#ACF';
}
