import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { createContext, runInContext } from "node:vm";

// O worker é um script clássico (usa postMessage/self), por isso é executado
// numa VM com os globais do worker simulados, sem rodar o setInterval.
// O setTimeout é interceptado para que o addLife não evapore a vida do player
// num ataque de teste (cada fireTimers aplica apenas um passo de vida).
const WORKER_SRC = readFileSync(
  new URL("../src/worker/worker.js", import.meta.url),
  "utf8"
).replaceAll("export const ", "const ");

const FLOOR_T = 3; // Topo do piso

function loadWorker() {
  const posted = [];
  const self = {};
  const timers = [];
  let nextId = 1;
  const sandbox = {
    console: { log() {} },
    log: () => {},
    performance: { now: () => 0 },
    postMessage: m => posted.push(m),
    self,
    setTimeout: (fn, ms, ...args) => {
      const handle = nextId++;
      timers.push({ handle, fn, args });
      return handle;
    },
    clearTimeout: handle => {
      const i = timers.findIndex(t => t.handle === handle);
      if (i !== -1) timers.splice(i, 1);
    },
    setInterval: () => 0,
  };
  runInContext(WORKER_SRC, createContext(sandbox));
  const fireTimers = () => {
    const pending = timers.splice(0);
    pending.forEach(({ fn, args }) => fn(...args));
  };
  return {
    loopInteration: sandbox.loopInteration,
    self,
    posted,
    timers,
    fireTimers,
  };
}

// 'B' = ser vivo, 'F' = floor (chão, só pés).
function newRino(overrides = {}) {
  return { K: 'B', S: 'R', x: 90, y: 0, z: 1, r: 1, w: 0, j: 0, P: 1, vx: 0, vy: 0, ...overrides };
}

// Inimigo: bounding box ESTÁTICA (o worker nunca recalcula L/R/T/B de um 'B'
// sem S:'R'), com 'l' de vida. O chifre inimigo fica em e2.x ± 6..8 (e2.r).
// Por padrão fica à direita e de frente para o player (r:-1 → chifre [-8,-6]).
function newEnemy(overrides = {}) {
  return {
    K: 'B', x: 100, y: 0, z: 1, r: -1, P: 0, l: 5, vx: 0, vy: 0,
    L: 84, R: 140, T: -5, B: 5, ...overrides,
  };
}

function floor(L = -100, R = 100, T = FLOOR_T, B = 100, z = 1) {
  return { K: 'F', L, R, T, B, z };
}

function startChapter(worker, elements, chapter = 1) {
  worker.self.onmessage({ data: ['NC', { c: chapter, e: elements }] });
}

function send(worker, event, payload) {
  worker.self.onmessage({ data: [event, payload] });
}

function loops(worker, n) {
  for (let i = 0; i < n; i++) worker.loopInteration();
}

function close(actual, expected, msg) {
  assert.ok(
    Math.abs(actual - expected) < 1e-6,
    `${msg}: ${actual} deve ser ~${expected}`
  );
}

function setupDashFight() {
  const worker = loadWorker();
  const rino = newRino();
  const enemy = newEnemy();
  startChapter(worker, [floor(), rino, enemy]);
  // 'DE' injeta energia (DEV ONLY): o player começa o 1º tique já dashing.
  send(worker, 'DE', 150);
  send(worker, 'Rd1');
  assert.equal(rino.D, 1);
  return { worker, rino, enemy };
}

describe("fight: dash ataca e é invulnerável", () => {
  it("dá golpe (l--), gasta energia, empurra e não machuca o player", () => {
    const { worker, rino, enemy } = setupDashFight();

    loops(worker, 1); // tic=1: blodTic=1 → 1º golpe
    assert.equal(enemy.l, 4, "inimigo perde 1 de vida por golpe");
    assert.equal(rino.D, 1, "continua dashing");
    assert.equal(rino.l, 1, "chifre que fere com dash não tira vida do player");
    close(rino.De, 139, "energia: -1 do tempo do dash e -10 do golpe");
    close(rino.x, 89.56, "dash avança (+0.56) mas o golpe recua (-1)");
    close(enemy.x, 102, "inimigo é empurrado 2px para longe (vec*2)");
  });

  it("a cada 3º tique (tic%3==0) o golpe sai do ar", () => {
    const { worker, enemy } = setupDashFight();

    loops(worker, 2); // tic 1 e 2 golpeiam
    assert.equal(enemy.l, 3, "dois golpes aplicados");
    loops(worker, 1); // tic=3: blodTic=0
    assert.equal(enemy.l, 3, "tic%3==0 não reduz a vida do inimigo");
  });

  it("zera a vida do inimigo e o transforma em K:'D' (w12/h6)", () => {
    const { worker, rino, enemy } = setupDashFight(); // l=5

    loops(worker, 7); // golpes nos tics 1,2,4,5,7 → l 5→0
    assert.equal(enemy.K, 'D', "inimigo morre quando l zera");
    assert.equal(enemy.w, 12, "corpo de morto: largura 12");
    assert.ok(
      enemy.h < 6 && enemy.h > 5.9,
      "corpo de morto: altura 6 que já começou a encolher (visto " + enemy.h + ")"
    );
    assert.equal(rino.l, 1, "player segue ileso durante todo o dash");
  });

  it("só golpeia quando o chifre alcança o inimigo", () => {
    const worker = loadWorker();
    // Corpo encosta no player, mas o chifre [x+6,x+8] não chega ao R=90 dele.
    const rino = newRino();
    const out = newEnemy({ L: 84, R: 90 });
    startChapter(worker, [floor(), rino, out]);
    send(worker, 'DE', 150);
    send(worker, 'Rd1');

    loops(worker, 2);
    assert.equal(out.l, 5, "sem contato do chifre não há golpe");
    close(rino.De, 148, "só o -1/tique do dash, sem o -10 do golpe");
    close(rino.x, 91.12, "avança reto, sem recuo de golpe");
  });
});

describe("fight: player vulnerável (fora do dash)", () => {
  it("perde vida com 1 golpe do chifre inimigo e não pode machucá-lo", () => {
    const worker = loadWorker();
    const rino = newRino();
    // r=-1, x=100 → chifre [92,94] cobre o corpo do player [84,98].
    const enemy = newEnemy();
    startChapter(worker, [floor(), rino, enemy]);

    loops(worker, 1); // tic=1 → blodTic=1 → golpe

    assert.equal(rino.l, 0, "player perde a vida");
    assert.ok(
      worker.posted.some(m => m[0] == 'S' && m[1][0][0] == 700),
      "posta o som de dano (700Hz)"
    );
    assert.ok(
      worker.posted.some(m => m[0] == 'NC' && m[1] == 99),
      "vida zerou: fim de jogo"
    );
    assert.equal(enemy.l, 5, "player vulnerável não danifica o inimigo");
    close(rino.x, 89.5, "recuo do player: -vec/2");
    close(enemy.x, 100.5, "recuo do inimigo: +vec/2");
  });

  it("a cada 3º tique o chifre inimigo também erra", () => {
    const worker = loadWorker();
    const rino = newRino();
    const enemy = newEnemy();
    startChapter(worker, [floor(), rino, enemy]);

    // Concede mais vidas antes do combate (addLife interceptado).
    for (let i = 0; i < 4; i++) worker.fireTimers(); // rinoLife 1→5

    loops(worker, 3); // tics 1 e 2 golpeiam; tic 3 erra
    assert.equal(rino.l, 3, "dois golpes sofridos e o 3º tique não dói");

    loops(worker, 1); // tic 4 golpeia
    assert.equal(rino.l, 2, "o tique seguinte volta a ferir");
  });
});