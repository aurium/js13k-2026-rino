import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { createContext, runInContext } from "node:vm";

// O worker é um script clássico (usa postMessage/self), por isso é executado
// numa VM com os globais do worker simulados, sem rodar o setInterval.
// Diferente do teste de colisão, aqui o setTimeout é interceptado para que os
// testes possam disparar os estágios do salto (1→2→3→4) manualmente.
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
    performance: { now: () => 0 },
    postMessage: m => posted.push(m),
    self,
    setTimeout: fn => {
      const handle = nextId++;
      timers.push({ handle, fn });
      return handle;
    },
    clearTimeout: handle => {
      const i = timers.findIndex(t => t.handle === handle);
      if (i !== -1) timers.splice(i, 1);
    },
    setInterval: () => 0,
  };
  runInContext(WORKER_SRC, createContext(sandbox));
  // Dispara apenas os timers pendentes neste momento; timers criados durante a
  // execução dos callbacks (ex.: 1→2 agenda o 2→3) só sobem no próximo tiro.
  const fireTimers = () => {
    const pending = timers.splice(0);
    pending.forEach(({ fn }) => fn());
  };
  return {
    loopInteration: sandbox.loopInteration,
    self,
    posted,
    timers,
    fireTimers,
  };
}

// Klasses: 'B' = ser vivo, 'F' = floor (chão, só pés).
// No capítulo 1 o dash só é liberado com x >= 10; x começa em 10.
function newRino(overrides = {}) {
  return { K: 'B', S: 'R', x: 10, y: 0, z: 1, r: 1, w: 0, j: 0, P: 1, ...overrides };
}

function floor(L = -100, R = 100, T = FLOOR_T, B = 100, z = 1) {
  return { K: 'F', L, R, T, B, z };
}

function tick(fn, times) {
  for (let i = 0; i < times; i++) fn();
}

function startChapter(worker, chapter = 1, elements) {
  worker.self.onmessage({ data: ['NC', { c: chapter, e: elements }] });
}

function push(worker, event) {
  worker.self.onmessage({ data: [event] });
}

function close(actual, expected, msg) {
  assert.ok(
    Math.abs(actual - expected) < 1e-9,
    `${msg}: ${actual} deve ser ~${expected}`
  );
}

// Capítulo 1 com o rino em x >= 10: o dash é liberado e a energia salta de -1
// para 150 no primeiro tique, permitindo testar sem drenar a carga.
function setupDashing(worker, extra = []) {
  const rino = newRino();
  startChapter(worker, 1, [floor(), rino, ...extra]);
  worker.loopInteration();
  return rino;
}

describe("dash: evento UE (Update Elements) preserva o rino", () => {
  it("UE troca a lista mantendo a referência do rino player", () => {
    const worker = loadWorker();
    const rino = setupDashing(worker);
    assert.equal(rino.De, 150);

    // A main thread manda uma lista nova com um player "de aquecimento":
    // o worker deve descartá-lo e reutilizar a referência atual de rino.
    const fresh = newRino({ vy: 0 });
    worker.self.onmessage({ data: ['UE', [floor(), fresh, newRino({ x: -30, P: 0, vy: 0 })]] });

    push(worker, 'Rj1');
    assert.equal(rino.j, 1, "o salto age sobre o rino original, não o da lista nova");
    assert.equal(rino.x, 10, "posição original preservada (não a do rino novo)");

    worker.loopInteration();
    assert.equal(rino.vy, -0.02, "impulso aplicado no rino original");

    // A lista que o loop posta guarda a MESMA instância do rino.
    const ePost = worker.posted.findLast(m => m[0] == 'E');
    assert.ok(ePost[1].find(el => el.P) === rino, "player da lista é o rino original");
  });

  it("UE permite posições novas (teleporte/arraste) sem perder o controle", () => {
    const worker = loadWorker();
    const rino = setupDashing(worker);

    // A main thread reposiciona o player NA LISTA (mesma referência rino).
    rino.x = 50;
    rino.y = 0;
    worker.self.onmessage({ data: ['UE', [floor(), rino]] });

    push(worker, 'Rd1');
    worker.loopInteration();
    close(rino.x, 50 + 0.56, "dash avança a partir da posição atualizada");
    assert.equal(rino.D, 1, "dash continua controlado pela instância original");
  });
});

describe("dash: eventos Rd1/Rd0 e energia", () => {
  it("RD1 liga o dash (D=1) e RD0 encerra (D=0)", () => {
    const worker = loadWorker();
    const rino = setupDashing(worker);
    assert.equal(rino.De, 150); // energia cheia após o 1º tique do cap. 1

    push(worker, 'Rd1');
    assert.equal(rino.D, 1);

    push(worker, 'Rd0');
    assert.equal(rino.D, 0);
  });

  it("RD1 sem energia não liga o dash (capítulo 2 não carregado)", () => {
    const worker = loadWorker();
    const rino = newRino();
    startChapter(worker, 2, [floor(), rino]);
    // Tique apenas para ativar o gate de dash; a energia ainda é 0.
    worker.loopInteration();
    assert.equal(rino.De, 0);

    push(worker, 'Rd1');
    assert.equal(rino.D, undefined);
  });

  it("dash consome 1 de energia por tique", () => {
    const worker = loadWorker();
    const rino = setupDashing(worker);

    push(worker, 'Rd1');
    worker.loopInteration();
    assert.equal(rino.De, 149);

    worker.loopInteration();
    assert.equal(rino.De, 148);
  });

  it("dash termina sozinho quando a energia acaba", () => {
    const worker = loadWorker();
    const rino = setupDashing(worker);
    push(worker, 'Rd1');
    // ~150 de energia, com recarga a cada 10 tiques: sobra pouquíssimo por
    // tique (~9 em 10 são consumidos), então o dash esgota em ~170 tiques.
    tick(worker.loopInteration, 300);
    assert.equal(rino.D, 0); // encerrou sem RD0
    const xEnd = rino.x; // posição no fim do dash
    assert.ok(rino.De < 150); // energia foi drenada

    // Depois do fim o rino não se move sozinho (w=0, sem dash).
    worker.loopInteration();
    assert.equal(rino.x, xEnd, "sem movimento após esgotar a energia");
  });

  it("recarga de energia: +1 a cada 10 tiques (até 150)", () => {
    const worker = loadWorker();
    const rino = newRino();
    startChapter(worker, 2, [floor(), rino]);

    tick(worker.loopInteration, 10);
    assert.equal(rino.De, 1);

    tick(worker.loopInteration, 10);
    assert.equal(rino.De, 2);
  });

  it("capítulo 1: dash só é liberado com x >= 10", () => {
    const worker = loadWorker();
    const rino = newRino({ x: 5 });
    startChapter(worker, 1, [floor(), rino]);

    worker.loopInteration();
    assert.equal(rino.De, -1); // energy desligada antes do gate

    rino.x = 10;
    worker.loopInteration();
    assert.equal(rino.De, 150); // gate passa e o dash liga

    push(worker, 'Rd1');
    assert.equal(rino.D, 1);
  });
});

describe("dash horizontal (0°)", () => {
  it("vx = .56*r e vy = 0 (linha reta, sem gravidade)", () => {
    const worker = loadWorker();
    const rino = setupDashing(worker);
    const x0 = rino.x;
    const y0 = rino.y;

    push(worker, 'Rd1');
    worker.loopInteration();

    close(rino.vx, 0.56 * 1, "vx no chão");
    assert.equal(rino.vy, 0);
    close(rino.x, x0 + 0.56, "x avança");
    assert.equal(rino.y, y0, "y não muda no chão");
    assert.equal(rino.j, 0, "j fica 0 no dash horizontal");
  });

  it("dash para a esquerda: vx = .56 * r com r = -1", () => {
    const worker = loadWorker();
    const rino = setupDashing(worker);
    rino.r = -1;
    const x0 = rino.x;

    push(worker, 'Rd1');
    worker.loopInteration();

    close(rino.vx, -0.56, "vx para a esquerda");
    close(rino.x, x0 - 0.56, "x recua");
  });

  it("não muda de direção durante o dash", () => {
    const worker = loadWorker();
    const rino = setupDashing(worker);
    rino.r = 1;

    push(worker, 'Rd1');
    push(worker, 'Rgl1'); // quer ir para a esquerda, mas está dashing
    assert.equal(rino.r, 1, "sentido travado durante o dash");
    assert.equal(rino.D, 1);

    push(worker, 'Rd0');
    push(worker, 'Rgl1'); // agora pode mudar
    assert.equal(rino.r, -1);
  });

  it("não salta durante o dash", () => {
    const worker = loadWorker();
    const rino = setupDashing(worker);

    push(worker, 'Rd1');
    push(worker, 'Rj1'); // quer saltar, mas está dashing
    assert.equal(rino.j, 0);
    assert.equal(rino.D, 1);

    push(worker, 'Rd0');
    push(worker, 'Rj1'); // agora o salto funciona
    assert.equal(rino.j, 1);
  });

  it("sobre um vão o dash horizontal suspende a gravidade (y constante)", () => {
    const worker = loadWorker();
    const rino = newRino();
    // Sem chão: fora do dash o rino caía (j=4), mas durante o dash não cai.
    startChapter(worker, 1, [rino]);
    worker.loopInteration(); // sem chão: fica em queda? não, só após o gate.
    assert.equal(rino.j, 4, "sem chão o rino entra em queda");

    const x0 = rino.x;
    const y0 = rino.y;
    push(worker, 'Rd1'); // dash horizontal: j volta para 0
    assert.equal(rino.j, 0);

    worker.loopInteration();
    worker.loopInteration();
    worker.loopInteration();

    assert.equal(rino.vy, 0, "sem aceleração vertical durante o dash");
    assert.equal(rino.y, y0, "não cai durante o dash");
    assert.equal(rino.j, 0, "permanece dashing, não em queda");
    close(rino.x, x0 + 3 * 0.56, "avança em linha reta");

    push(worker, 'Rd0');
    worker.loopInteration();
    assert.equal(rino.j, 4, "sem chão e sem dash, volta a cair");
  });
});

describe("dash de 45° (durante os estágios 1/2 do salto)", () => {
  it("RD1 no estágio 1 do salto vira 45° (j=2) sem gravidade", () => {
    const worker = loadWorker();
    const rino = setupDashing(worker);

    push(worker, 'Rj1'); // estágio 1
    assert.equal(rino.j, 1);
    push(worker, 'Rd1');
    assert.equal(rino.j, 2, "segura o estágio 2 enquanto dashing");
    assert.equal(rino.D, 1);

    const x0 = rino.x;
    const y0 = rino.y;
    worker.loopInteration();

    close(rino.vx, 0.4 * 1, "vx de 45°");
    close(rino.vy, -0.4, "vy de 45° (sobe)");
    close(rino.x, x0 + 0.4, "avança");
    close(rino.y, y0 - 0.4, "sobe");
    assert.equal(rino.j, 2);

    worker.loopInteration();
    close(rino.vy, -0.4, "vy mantém -.4 (gravidade não age no dash)");
    assert.equal(rino.j, 2, "mantém j=2 até o fim do dash");
  });

  it("RD1 já no estágio 2 também vira dash de 45°", () => {
    const worker = loadWorker();
    const rino = setupDashing(worker);

    push(worker, 'Rj1');
    worker.fireTimers(); // 1→2
    assert.equal(rino.j, 2);

    push(worker, 'Rd1'); // cancela o timer restante e segura j=2
    assert.equal(rino.j, 2);
    assert.equal(rino.D, 1);

    worker.loopInteration();
    close(rino.vy, -0.4, "dash de 45° ativo");
  });

  it("fim do dash de 45°: D=0, volta ao estágio 3 e segue para o 4", () => {
    const worker = loadWorker();
    const rino = setupDashing(worker);

    push(worker, 'Rj1');
    push(worker, 'Rd1'); // j=2, D=1

    push(worker, 'Rd0');
    assert.equal(rino.D, 0);
    assert.equal(rino.j, 3, "dash 45° termina no estágio 3 do salto");

    worker.fireTimers(); // rinoIsDropping (300ms)
    assert.equal(rino.j, 4, "segue naturalmente para o estágio 4");
  });

  it("dash fora dos estágios 1/2 é sempre horizontal (j volta a 0)", () => {
    const worker = loadWorker();
    const rino = setupDashing(worker);

    push(worker, 'Rj1');
    worker.fireTimers(); // j=2
    worker.fireTimers(); // j=3 (pico do salto)
    assert.equal(rino.j, 3);

    push(worker, 'Rd1'); // não é estágio 1 nem 2 → dash horizontal
    assert.equal(rino.j, 0);
    assert.equal(rino.D, 1);

    worker.loopInteration();
    close(rino.vy, 0, "dash horizontal, sem componente vertical");
    close(rino.vx, 0.56, "velocidade horizontal");
  });
});