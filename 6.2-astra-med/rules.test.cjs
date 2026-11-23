const { test } = require("node:test");
const assert = require("node:assert/strict");
const { start, advance, steer, plant, size } = require("./rules.js");
const running = () => ({ ...start(), phase: "running" });

test("espera mantém a posição e uma nova partida zera o placar", () => {
  const game = start();
  advance(game);
  assert.deepEqual(game, start());
  assert.equal(game.points, 0);
});

test("movimento contínuo, curva e bloqueio de inversão no mesmo passo", () => {
  const game = running();
  steer(game, "north");
  steer(game, "west");
  advance(game);
  advance(game);
  assert.equal(game.body[0], 170 - 2 * size);
  assert.equal(game.body.length, 3);
});

test("maçã aumenta comprimento e pontos e reaparece em casa livre", () => {
  const game = running();
  game.fruit = 171;
  advance(game);
  assert.equal(game.body.length, 4);
  assert.equal(game.points, 10);
  assert.equal(game.body.includes(game.fruit), false);
});

test("cada casa livre pode receber a maçã", () => {
  const game = running();
  const empty = Array.from({length: size ** 2}, (_, i) => i).filter(i => !game.body.includes(i));
  empty.forEach((cell, i) => {
    plant(game, () => (i + 0.5) / empty.length);
    assert.equal(game.fruit, cell);
  });
});

test("as quatro paredes encerram a partida", () => {
  for (const [head, turn] of [[18, "west"], [17, "east"], [4, "north"], [320, "south"]]) {
    const game = { ...running(), body: [head], turn };
    advance(game);
    assert.equal(game.phase, "lost");
  }
});

test("a cauda pode liberar sua casa, o corpo bloqueia", () => {
  for (const [body, expected] of [[[19, 1, 0, 18], "running"], [[19, 1, 0, 18, 36], "lost"]]) {
    const game = { ...running(), body, turn: "west" };
    advance(game);
    assert.equal(game.phase, expected);
  }
});

test("a última maçã encerra com vitória", () => {
  const game = { ...running(), body: Array.from({length: size ** 2 - 1}, (_, i) => i + 1), turn: "west", fruit: 0 };
  advance(game);
  assert.equal(game.phase, "won");
  assert.equal(game.fruit, null);
});
