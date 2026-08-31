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
    groundTopFor: sandbox.groundTopFor,
    self,
    posted,
  };
}

function newChapter() {
  const rino = { K: 'B', x: 0, y: 0, z: 1, r: 1, w: 0, j: 0, P: 1 };
  const floor = { K: 'T', L: -100, R: 100, T: FLOOR_T, B: FLOOR_B, z: 1 };
  return { e: [floor, rino], rino };
}

function tick(fn, times) {
  for (let i = 0; i < times; i++) fn();
}

it("colisão com o chão: o rino não atravessa o piso e para de cair", () => {
  const { loopInteration, self } = loadWorker();
  const { e, rino } = newChapter();
  self.onmessage({ data: ['NC', { c: 1, e }] });

  self.onmessage({ data: ['Rj1', {}] }); // começa a subir
  let maxY = rino.y;
  tick(() => {
    loopInteration();
    maxY = Math.max(maxY, rino.y);
  }, 30);
  assert.ok(rino.y < 0, "deveria ter subido acima do topo do piso");

  self.onmessage({ data: ['Rj0', {}] }); // solta o salto: começa a cair
  tick(() => {
    loopInteration();
    maxY = Math.max(maxY, rino.y);
  }, 500);

  const restY = FLOOR_T - 3; // as patas repousam sobre o topo do piso
  assert.equal(maxY, restY, "o rino nunca deve passar do topo do piso (y era menor=mais alto)");
  assert.equal(rino.y, restY, "deve repousar exatamente sobre o topo do piso");
  assert.equal(rino.j, 0, "apoiado, o rino não deve ficar em estado de salto");

  tick(loopInteration, 60); // já apoiado: deve permanecer estável
  assert.equal(rino.y, restY, "tendo parado de cair, deve ficar parado sobre o piso");
});

it("colisão com o chão: rino dentro do bloco do piso caindo volta a apoiar sobre ele", () => {
  const { loopInteration, self } = loadWorker();
  const { e, rino } = newChapter();
  rino.y = FLOOR_T + 5; // dentro do bloco do piso, abaixo do topo
  self.onmessage({ data: ['NC', { c: 1, e }] });
  rino.j = 4; // em queda

  tick(loopInteration, 2);

  assert.equal(rino.y, FLOOR_T - 3, "deve voltar a apoiar sobre o topo do piso");
  assert.equal(rino.j, 0);
});

it("sem chão sob as patas, o rino perde o apoio e entra em queda (j=4)", () => {
  const { loopInteration, self } = loadWorker();
  const rino = { K: 'B', x: 0, y: 0, z: 1, r: 1, w: 0, j: 0, P: 1 };
  self.onmessage({ data: ['NC', { c: 1, e: [rino] }] });

  loopInteration();
  assert.equal(rino.j, 4, "sem apoio o rino deve entrar em queda");

  const startY = rino.y;
  tick(loopInteration, 100);
  assert.ok(rino.y > startY, "sem piso o rino deve seguir caindo");
});

it("apenas uma pata com chão: o rino perde o apoio e entra em queda (j=4)", () => {
  const { loopInteration, self } = loadWorker();
  // piso estreito sob apenas a pata dianteira: traseira (-4), dianteira (+2)
  const rino = { K: 'B', x: 0, y: 0, z: 1, r: 1, w: 0, j: 0, P: 1 };
  const floor = { K: 'T', L: -3, R: 4, T: FLOOR_T, B: FLOOR_B, z: 1 };
  self.onmessage({ data: ['NC', { c: 1, e: [floor, rino] }] });

  loopInteration();

  assert.equal(rino.j, 4, "com uma pata sem chão o rino deve entrar em queda");
});

describe("groundTopFor", () => {
  const rino = { K: 'B', x: 0, y: 0, z: 1, r: 1, w: 0, j: 0, P: 1 };
  const floor = (L, R, T, B, z = 1, k = 'T') => ({ K: k, L, R, T, B, z });

  function load(e) {
    const { groundTopFor, self } = loadWorker();
    self.onmessage({ data: ['NC', { c: 1, e }] });
    return groundTopFor;
  }

  it("retorna o topo (T) quando a pata está sobre um elemento de chão no mesmo z", () => {
    const groundTopFor = load([floor(-10, 10, 3, 100), rino]);
    assert.equal(groundTopFor(0, 3), 3); // pata tocando o topo
    assert.equal(groundTopFor(0, 10), 3); // pata dentro do corpo do piso
  });

  it("retorna null com a pata acima do topo (no ar, ainda não tocando)", () => {
    const groundTopFor = load([floor(-10, 10, 3, 100), rino]);
    assert.equal(groundTopFor(0, 2), null);
  });

  it("retorna null com a pata abaixo do fundo do piso", () => {
    const groundTopFor = load([floor(-10, 10, 3, 100), rino]);
    assert.equal(groundTopFor(0, 101), null);
  });

  it("retorna null com a pata fora do limite horizontal do piso", () => {
    const groundTopFor = load([floor(-10, 10, 3, 100), rino]);
    assert.equal(groundTopFor(-11, 3), null);
    assert.equal(groundTopFor(11, 3), null);
  });

  it("ignora elementos de outro layer Z", () => {
    const groundTopFor = load([
      floor(-10, 10, -5, 100, 2), // piso mais alto, porém em outro z
      floor(-10, 10, 3, 100, 1),
      rino,
    ]);
    assert.equal(groundTopFor(0, 3), 3, "deve considerar apenas o piso do mesmo z");
    assert.equal(groundTopFor(0, 0), null, "piso de outro z não apoia esta pata");
  });

  it("considera elementos do mesmo layer Z do rino", () => {
    const groundTopFor = load([
      floor(-10, 10, -5, 100, 3), // outros z também presentes
      floor(-10, 10, 3, 100, 1),
      rino,
    ]);
    assert.equal(groundTopFor(0, 3), 3);
  });

  it("considera objetos K:'O' como chão, desde que no mesmo z", () => {
    const floorO = floor(-10, 10, 3, 100, 1, 'O');
    const groundTopFor = load([floorO, rino]);
    assert.equal(groundTopFor(0, 3), 3);
    const floorOtherZ = floor(-10, 10, 3, 100, 2, 'O');
    const groundTopForOtherZ = load([floorOtherZ, rino]);
    assert.equal(groundTopForOtherZ(0, 3), null);
  });

  it("ignora o próprio rino e outros seres (K:'B')", () => {
    const groundTopFor = load([
      floor(-10, 10, 3, 100, 1),
      { K: 'B', x: 0, y: 0, z: 1, P: 0 }, // outro ser vivo, não é chão
      rino,
    ]);
    assert.equal(groundTopFor(0, 3), 3);
  });

  it("retorna o topo do primeiro elemento de chão que casa (ordem do array)", () => {
    const groundTopFor = load([
      floor(-10, 10, 7, 100, 1),
      floor(-10, 10, 3, 100, 1),
      rino,
    ]);
    assert.equal(groundTopFor(0, 8), 7);
  });
});