// import { add } from "../build/release.js";
// console.log('ADD:', add(1, 2));

const log = console.log;

let { PI, abs, sqrt, cos, sin } = Math;

let
  curChapter = 0,
  chapters = [],
  elements,
  chapterCanvas = cover,
  oldChapterCanvas,
  ctx,
  zoom = 1,
  unt = 1,
  drawingPlanZ = 1,
  camera = {x:0, y:0},
  oneTurn = 2 * PI,
  inputDisabled = 1,
  rino = {},
  worker = new Worker('worker.js');

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
  ctx.fillStyle = '#000';
  ctx.textAlign = 'left';
  ctx.font = `bold ${5*unt}px cursive`;
  ctx.fillText(`Chapter ${curChapter}`, unt*2, unt*5);
  ctx.font = `bold ${4*unt}px cursive`;
  ctx.fillText(chapters[curChapter].t, unt*2, unt*9);
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
      //log(m+':',m2);
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
  ctx.C = (cx,cy,r, strokeStyle, fillStyle)=> {
    ctx.strokeStyle = '#'+strokeStyle;
    ctx.fillStyle = '#'+fillStyle;
    ctx.beginPath();
    ctx.ellipse(untZ(cx - camera.x), untZ(cy - camera.y), untZ(r), untZ(r), 0, 0, oneTurn);
    ctx.closePath();
    fillStyle && ctx.fill();
    strokeStyle && ctx.stroke();
  }
  return ctx;
}

function style(strokeStyle='000', lineWidth=.2, fillStyle='AAA') {
  ctx.strokeStyle = '#'+strokeStyle;
  ctx.lineWidth = lineWidth * unt * sqrt(.75+drawingPlanZ/4);
  ctx.fillStyle = '#'+fillStyle;
  ctx.lineJoin = 'round';
}

function mkPath(...p) {
  return new Path2D(p.map((v,i)=>
    v=='z' ? v :
    (i==0 ? 'M' : i%2==0 ? 'L' : ',') +
    untZ(i%2==0 ? (v-camera.x) : (v-camera.y))
  ).join(''))
}
