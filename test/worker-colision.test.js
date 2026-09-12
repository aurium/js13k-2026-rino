import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { createContext, runInContext } from "node:vm";

// O worker é um script clássico (usa postMessage/self), por isso é executado
// numa VM com os globais do worker simulados, sem rodar o setInterval.
const WORKER_SRC = readFileSync(
  new URL("../src/worker/worker.js", import.meta.url),
  "utf8"
).replaceAll("export const ", "const ");

const FLOOR_T = 3; // Topo do piso
const FLOOR_B = 100; // Fundo do piso

function loadWorker() {
  const posted = [];
  const self = {};
  const sandbox = {
    console: { log() {} },
    log: () => {},
    performance: { now: () => 0 },
    postMessage: m => posted.push(m),
    self,
    setTimeout: () => 0,
    clearTimeout: () => {},
    setInterval: () => 0,
  };
  runInContext(WORKER_SRC, createContext(sandbox));
  return {
    loopInteration: sandbox.loopInteration,
    rinoIsGrounded: sandbox.rinoIsGrounded,
    self,
    posted,
  };
}

// Klasses: 'B' = ser vivo, 'F' = floor (chão, só pés), 'W' = wall (só colisão X),
// 'O' = object (empurra os dois em sentidos contrários).
function newRino(overrides = {}) {
  return { K: 'B', S: 'R', x: 0, y: 0, z: 1, r: 1, w: 0, j: 0, P: 1, ...overrides };
}

function floor(L = -100, R = 100, T = FLOOR_T, B = FLOOR_B, z = 1) {
  return { K: 'F', L, R, T, B, z };
}

function wall(L, R, T, B, z = 1) {
  // ClassWall real define x = (L+R)/2; a nova colisão usa e2.x no vetor.
  return { K: 'W', L, R, T, B, z, x: (L + R) / 2 };
}

function box(x, y, w, h, z = 1) {
  return { K: 'O', x, y, w, h, z };
}

function tick(fn, times) {
  for (let i = 0; i < times; i++) fn();
}

it("colisão com o chão: o rino pousa na faixa do topo (F) e para de cair", () => {
  const { loopInteration, self } = loadWorker();
  const rino = newRino();
  self.onmessage({ data: ['NC', { c: 1, e: [floor(), rino] }] });

  self.onmessage({ data: ['Rj1', {}] }); // começa a subir
  tick(loopInteration, 30);
  assert.ok(rino.y < 0, "deveria ter subido acima do topo do piso");

  self.onmessage({ data: ['Rj0', {}] }); // solta o salto: começa a cair
  let maxY = rino.y;
  tick(() => {
    loopInteration();
    maxY = Math.max(maxY, rino.y);
  }, 500);

  // as patas (B=y+3) param dentro da faixa de pouso [T, T+0.7)
  assert.ok(maxY < FLOOR_T - 3 + .7, "nunca deve afundar além da faixa de pouso");
  assert.ok(
    rino.y >= FLOOR_T - 3 && rino.y < FLOOR_T - 3 + .7,
    "deve repousar com as patas na faixa do topo do piso"
  );
  assert.equal(rino.j, 0, "apoiado, o rino não deve ficar em estado de salto");

  const restY = rino.y;
  tick(loopInteration, 60); // já apoiado: deve permanecer estável
  assert.equal(rino.y, restY, "tendo pousado, deve ficar parado sobre o piso");
});

it("sem chão sob as patas, o rino perde o apoio e entra em queda (j=4)", () => {
  const { loopInteration, self } = loadWorker();
  const rino = newRino();
  self.onmessage({ data: ['NC', { c: 1, e: [rino] }] });

  loopInteration();
  assert.equal(rino.j, 4, "sem apoio o rino deve entrar em queda");

  const startY = rino.y;
  tick(loopInteration, 60);
  assert.ok(rino.y > startY, "sem piso o rino deve seguir caindo");
});

it("apenas uma pata com chão: o rino perde o apoio e entra em queda (j=4)", () => {
  const { loopInteration, self } = loadWorker();
  const rino = newRino();
  // piso estreito sob apenas a pata dianteira (+2): a traseira (-4) fica fora.
  self.onmessage({ data: ['NC', { c: 1, e: [floor(-3, 4), rino] }] });

  loopInteration();

  assert.equal(rino.j, 4, "com uma pata sem chão o rino deve entrar em queda");
});

describe("rinoIsGrounded", () => {
  // rinoIsGrounded lê someRino.B; B só é setado no loopInteration
  // (B = y + 3). Aqui o setamos a partir de y, posição de repouso.
  function loaded(e) {
    const { rinoIsGrounded, self } = loadWorker();
    self.onmessage({ data: ['NC', { c: 1, e }] });
    const rino = e.find(el => el.P);
    rino.B = rino.y + 3;
    return { rino, rinoIsGrounded };
  }

  it("true com as duas patas (x-4*r e x+2*r) sobre o topo de um piso F no mesmo z", () => {
    const { rino, rinoIsGrounded } = loaded([floor(-10, 10), newRino()]);
    assert.ok(rinoIsGrounded(rino), "patas em -4 e +2 dentro de (-10,10), B na faixa");
  });

  it("false com apenas uma pata sobre o piso", () => {
    const { rino, rinoIsGrounded } = loaded([floor(-3, 4), newRino()]);
    assert.ok(!rinoIsGrounded(rino), "pata traseira (-4) fora de (-3,4)");
  });

  it("false com as patas acima do topo (B < T)", () => {
    const { rino, rinoIsGrounded } = loaded([floor(-10, 10), newRino()]);
    rino.y = -1;
    rino.B = rino.y + 3; // B = 2 < 3
    assert.ok(!rinoIsGrounded(rino));
  });

  it("false com as patas abaixo da faixa de pouso (B >= T+0.7)", () => {
    const { rino, rinoIsGrounded } = loaded([floor(-10, 10), newRino()]);
    rino.y = 1;
    rino.B = rino.y + 3; // B = 4 >= 3.7
    assert.ok(!rinoIsGrounded(rino));
  });

  it("bordas horizontais exclusivas: pata exatamente em cima de L/R não apoia", () => {
    const left = loaded([floor(-4, 4), newRino()]); // pata traseira em -4 == L
    assert.ok(!left.rinoIsGrounded(left.rino));
    const insideLeft = loaded([floor(-5, 4), newRino()]);
    assert.ok(insideLeft.rinoIsGrounded(insideLeft.rino), "-4 > -5 deve apoiar");
    const right = loaded([floor(-4, 2), newRino()]); // pata dianteira em 2 == R
    assert.ok(!right.rinoIsGrounded(right.rino));
    const insideRight = loaded([floor(-6, 3), newRino()]);
    assert.ok(insideRight.rinoIsGrounded(insideRight.rino), "2 < 3 deve apoiar");
  });

  it("com r=-1 as patas invertem (x+4 e x-2)", () => {
    const { rino, rinoIsGrounded } = loaded([floor(-3, 5), newRino({ r: -1 })]);
    assert.ok(rinoIsGrounded(rino), "patas em 4 e -2 dentro de (-3,5)");
  });

  it("objetos K:'O' apoiam no mesmo z, mas não em z diferente", () => {
    const same = loaded([
      { K: 'O', L: -5, R: 5, T: -5, B: 5, z: 1 },
      newRino({ y: -8 }), // B = -5 na faixa de pouso [-5,-4.3)
    ]);
    assert.ok(same.rinoIsGrounded(same.rino));
    const otherZ = loaded([
      { K: 'O', L: -5, R: 5, T: -5, B: 5, z: 2 },
      newRino({ y: -8 }),
    ]);
    assert.ok(!otherZ.rinoIsGrounded(otherZ.rino), "objeto de outro z não apoia");
  });

  it("paredes K:'W' não apoiam as patas", () => {
    const { rino, rinoIsGrounded } = loaded([
      wall(-10, 10, FLOOR_T, FLOOR_B),
      newRino(),
    ]);
    assert.ok(!rinoIsGrounded(rino));
  });

  it("os próprios seres K:'B' (sem piso/objeto) não apoiam", () => {
    const { rino, rinoIsGrounded } = loaded([newRino()]);
    assert.ok(!rinoIsGrounded(rino));
  });

  it("um NPC apoiado não altera o y do player (cada rino apoia no próprio piso)", () => {
    const { loopInteration, self } = loadWorker();
    // Player em y=0 sobre o piso A (T=3). NPC em y=7 sobre o piso B (T=10).
    // Ambos no mesmo z: se o cálculo usasse referências globais, o apoio do
    // NPC puxaria o player, que perdiaria o próprio chão (bug do cap. 01).
    const player = newRino();
    const npc = newRino({ x: 0, y: 7, P: 0, vy: 0 });
    self.onmessage({
      data: ['NC', { c: 1, e: [floor(), floor(-100, 100, 10, 100), player, npc] }],
    });

    loopInteration();
    assert.equal(player.y, 0, "o player continua apoiado no próprio piso A");
    assert.equal(npc.y, 7, "o NPC apoia no piso B (y = T - 3)");
    assert.equal(player.j, 0, "o player não entrou em queda");
  });
});

describe("colisão horizontal", () => {
  // A nova resolução é posicional: o loop do worker passa por cada B/O (e1),
  // procura overlap de caixa com W/O/B (e2) e empurra APENAS e1 para fora, por
  // `(inside+1)/9`, onde `inside` é a penetração horizontal e a direção é
  // `Math.sign(e1.x - e2.x)`. Paredes (W) nunca são empurradas; objetos (O) são
  // empurrados na sua própria iteração; dois seres (B) não colidem entre si.

  function loaded(e, rinoOverrides = {}) {
    const { loopInteration, self } = loadWorker();
    const rino = newRino(rinoOverrides);
    self.onmessage({ data: ['NC', { c: 1, e: [floor(), ...e, rino] }] });
    return { loopInteration, rino };
  }

  describe("parede K:'W'", () => {
    const wRight = wall(7, 20, -50, 50); // x = 13.5

    it("empurra o rino para fora: (inside+1)/9 na direção de e1.x - e2.x", () => {
      const { loopInteration, rino } = loaded([wRight]);
      loopInteration();
      // overlap de 1 unidade (R=8 contra L=7), vec = sign(0 - 13.5) = -1
      assert.ok(Math.abs(rino.x - (-2 / 9)) < 1e-12, "(1*-1 - 1)/9 = -2/9");
    });

    it("parede à esquerda: empurra no sentido contrário (vec = +1)", () => {
      const { loopInteration, rino } = loaded([wall(-20, -7, -50, 50)], { x: -2 });
      loopInteration();
      // overlap de 1 unidade (L=-8 contra R=-7), vec = sign(-2+13.5) = +1
      assert.ok(Math.abs(rino.x - (-16 / 9)) < 1e-12, "-2 + (1*1 + 1)/9 = -16/9");
    });

    it("nunca é empurrada (W nunca aparece como e1 no loop)", () => {
      const { loopInteration, self } = loadWorker();
      const rino = newRino();
      const w = wall(7, 20, -50, 50);
      self.onmessage({ data: ['NC', { c: 1, e: [floor(), w, rino] }] });
      const before = { L: w.L, R: w.R, x: w.x };
      loopInteration();
      assert.deepEqual({ L: w.L, R: w.R, x: w.x }, before);
    });

    it("separação convergente: nos ticks seguintes para de sobrepor e x estabiliza", () => {
      const { loopInteration, rino } = loaded([wRight]);
      tick(loopInteration, 60);
      assert.ok(rino.R <= 7 + 1e-9, "a frente (x+8) para de invadir a parede (L=7)");
      const xEnd = rino.x;
      tick(loopInteration, 20);
      assert.equal(rino.x, xEnd, "separado e sem walk, x não muda mais");
    });
  });

  describe("objeto K:'O'", () => {
    it("empurra o rino e o objeto em sentidos opostos (e1 x e2 em dois passos do loop)", () => {
      const { loopInteration, self } = loadWorker();
      // Novamente com L/R/T/B pré-definidos nos DOIS corpos: no worker atual as
      // caixas são (re)calculadas dentro do loop, na ordem do array; se o box
      // for processado antes do rino, o rino ainda não tem caixa neste tick.
      const rino = newRino({ L: -6, R: 8, T: -3, B: 3, vy: 0 });
      const box = { K: 'O', x: 4, y: 0, w: 4, h: 4, z: 1, vx: 0, vy: 0, L: 2, R: 6, T: -2, B: 2 };
      self.onmessage({ data: ['NC', { c: 1, e: [floor(), box, rino] }] });

      loopInteration();
      // box como e1: inside=6, vec=+1            => +7/9 (para a direita)
      // rino como e1 (caixa do box já atualizada): inside=6, vec=-1 => -7/9
      assert.ok(Math.abs(box.x - (4 + 7 / 9)) < 1e-12, "objeto empurrado para a direita");
      assert.ok(Math.abs(rino.x - (-7 / 9)) < 1e-12, "rino empurrado para a esquerda");
    });

    it("objeto se afasta e os dois estabilizam após deixarem de se sobrepor", () => {
      const { loopInteration, self } = loadWorker();
      const rino = newRino();
      const box = { K: 'O', x: 4, y: 0, w: 4, h: 4, z: 1, vx: 0, vy: 0 };
      self.onmessage({ data: ['NC', { c: 1, e: [floor(), box, rino] }] });

      tick(loopInteration, 10);
      assert.ok(rino.x < 0, "rino foi empurrado para a esquerda");
      assert.ok(box.x > 4, "objeto foi empurrado para a direita");
      assert.ok(rino.R < box.L, "deixaram de se sobrepor");

      const xr = rino.x, xb = box.x;
      tick(loopInteration, 20);
      assert.equal(rino.x, xr, "separados, o rino para");
      assert.equal(box.x, xb, "separados, o objeto para");
    });
  });

  describe("não colidem em X", () => {
    it("dois seres K:'B' entre si (Bio Being x Bio Being)", () => {
      const { loopInteration, self } = loadWorker();
      const a = newRino({ x: -5 });
      const b = newRino({ x: 6, P: 0 });
      self.onmessage({ data: ['NC', { c: 1, e: [a, b] }] });
      tick(loopInteration, 5);
      assert.equal(a.x, -5);
      assert.equal(b.x, 6);
    });

    it("pisos K:'F' no eixo X (o rino continua parado e apoiado)", () => {
      const { loopInteration, self } = loadWorker();
      const rino = newRino();
      self.onmessage({ data: ['NC', { c: 1, e: [floor(), rino] }] });
      tick(loopInteration, 5);
      assert.equal(rino.x, 0);
      assert.equal(rino.y, 0, "continua apoiado no piso");
    });

    it("consigo mesmo (e1 != e2)", () => {
      const { loopInteration, self } = loadWorker();
      const rino = newRino();
      self.onmessage({ data: ['NC', { c: 1, e: [rino] }] });
      loopInteration();
      assert.equal(rino.x, 0);
    });
  });
});

describe("paredes K:'W' bloqueiam o avanço", () => {
  function loaded(e) {
    const { loopInteration, self } = loadWorker();
    const rino = newRino();
    self.onmessage({ data: ['NC', { c: 1, e: [rino, ...e] }] });
    return { rino, loopInteration };
  }

  it("à direita: o rino andando não avança além da face da parede (fica recuado)", () => {
    const { rino, loopInteration } = loaded([floor(), wall(7, 20, -50, 50)]);
    rino.w = 1;
    tick(loopInteration, 20);

    assert.equal(rino.y, 0, "deve continuar apoiado no chão");
    // sem a parede ele avançaria ~+1.5; a resolução o recua e ele equilibra
    // com a frente (x+8) na face (L=7), i.e. x ≈ -1.
    assert.ok(rino.x < 0, "não avança contra a parede (foi recuado)");
    assert.ok(rino.x > -1.4, "não recua além da face (fica encostado junto)");
    assert.ok(rino.R <= 7.6, "a frente (x+8) não penetra fundo na parede");
  });

  it("à esquerda: idem, com o rino virado para a esquerda (r=-1)", () => {
    const { rino, loopInteration } = loaded([floor(), wall(-20, -7, -50, 50)]);
    rino.r = -1;
    rino.w = 1;
    tick(loopInteration, 2000);

    assert.equal(rino.y, 0, "deve continuar apoiado no chão");
    // equilibra com a dianteira (x+r-7) na face (R=-7), i.e. x ≈ 0.9.
    assert.ok(rino.x > 0.5, "não avança contra a parede à esquerda (foi recuado)");
    assert.ok(rino.x < 1.4, "não recua além da face (fica encostado junto)");
    assert.ok(rino.L >= -7.6, "a dianteira (x+r-7) não penetra fundo na parede");
  });
});
