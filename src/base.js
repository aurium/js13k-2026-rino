// import { add } from "../build/release.js";
// console.log('ADD:', add(1, 2));

const log = console.log;

let { PI:halfTurn, abs, sqrt, cos, sin, floor } = Math;

let
  fps = 60,
  lastChapterNum,
  curChapterNum = 0,
  curChapter,
  chapters = [],
  elements,
  chapterCanvas = cover,
  oldChapterCanvas,
  ctx,
  zoom = 1,
  unt = 1,
  drawingPlanZ = 1,
  camera = {x:0, y:0},
  oneTurn = 2 * halfTurn,
  limJumpAngle = halfTurn/4,
  inputDisabled = 1,
  rino = {},
  rinoLife = 0,
  rainbow = [], // The dash's glitter rainbow
  worker = new Worker('worker.js');

function transmissibleElements() {
  return elements.map(el => ({ ...el, d:0 }));
}

function disableInput(v=1) {
  rino.w = 0;
  inputDisabled = v;
}

window.setZoom = n => {
  if (n>3) n=3;
  zoom = n;
  onresize();
  qlt.selectedIndex = n-1;
  qlt.blur();
}

window.onresize = ()=> {
  chapterCanvas.width = document.body.clientWidth / zoom;
  chapterCanvas.height = document.body.clientHeight / zoom;
  unt = chapterCanvas.width / 80;
  chapterCanvas.r();
}

function writeTitle(ctx) {
  if (rino.x > 18) return;
  let alpha = 15;
  if (rino.x > 10) alpha = 35 - floor(rino.x*2);
  ctx.fillStyle = '#000'+alpha.toString(16);
  ctx.textAlign = 'left';
  let titleSize = 4
  if (curChapterNum!=99) {
    ctx.font = `bold ${5*unt}px cursive`;
    ctx.fillText(`Chapter ${curChapterNum}`, 2*unt, 5*unt);
  } else {
    titleSize = 8
  }
  ctx.font = `bold ${titleSize*unt}px cursive`;
  ctx.fillText(curChapter.t, 2*unt, 9*unt);
}

function writeHist() {
  if (!curChapter.h) return;
  ctx.fillStyle = '#000';
  ctx.textAlign = curChapter.h.p ? 'right' : 'left';
  ctx.font = `bold ${2*unt}px cursive`;
  curChapter.h.t.split('\n').map((s, i)=>
    ctx.fillText(s, (curChapter.h.p ? 77 : 3)*unt, (4+i*2)*unt)
  );
}

function mkPlayer(...a) {
  rino = ClassRino(...a);
  rino.P = 1; // is player
  return rino;
}

const untZ = (n)=> n * unt/(.75+drawingPlanZ/4)

function getCtx(canvas) {
  const ctx = canvas.getContext('2d');
  Object.keys(ctx.constructor.prototype).map(m => {
    if (ctx[m].call) {
      let m2 = m.replace(/(^..|[A-Z])[a-z]+/g, '$1')+m.at(-1);
      // log('CTX.'+m+':',m2);
      ctx[m2] = (...a)=> {
        a = a.map(n=>n.toFixed ? untZ(n) : n);
        return ctx[m](...a)
      }
    }
  });
  ctx.Q = (x,y,w,h)=> {
    ctx.fiRt(x - camera.x, y - camera.y, w, h);
    ctx.stRt(x - camera.x, y - camera.y, w, h);
  }
  ctx.C = (cx,cy,r, fillStyle)=> {
    ctx.fillStyle = fillStyle[0]=='h' ? fillStyle : '#'+fillStyle;
    ctx.beginPath();
    ctx.ellipse(untZ(cx - camera.x), untZ(cy - camera.y), untZ(r), untZ(r), 0, 0, oneTurn);
    ctx.closePath();
    fillStyle && ctx.fill();
    // strokeStyle && ctx.stroke();
  }
  return ctx;
}

function style(fillStyle='AAA', strokeStyle='000', lineWidth=.2) {
  ctx.strokeStyle = '#'+strokeStyle;
  ctx.lineWidth = lineWidth * unt * sqrt(.75+drawingPlanZ/4);
  ctx.fillStyle = fillStyle.toFixed ? `hsl(0 0 ${fillStyle})` : '#'+fillStyle;
  ctx.lineJoin = 'round';
}

function mkPath(...p) {
  return new Path2D(p.map((v,i)=>
    v=='z' ? v :
    (i==0 ? 'M' : i%2==0 ? 'L' : ',') +
    untZ(i%2==0 ? (v-camera.x) : (v-camera.y))
  ).join(''))
}

rt.onclick = ()=> nextChapter(lastChapterNum);
