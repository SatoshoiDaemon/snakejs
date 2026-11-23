"use strict";

const SnakeRules = (() => {
  const size = 18;
  const offsets = { north: -size, south: size, east: 1, west: -1 };

  function start() {
    return { body: [170, 169, 168], heading: "east", turn: "east", fruit: null, phase: "ready", points: 0 };
  }

  function plant(game, random = Math.random) {
    const taken = new Set(game.body);
    const empty = Array.from({ length: size * size }, (_, i) => i).filter(i => !taken.has(i));
    game.fruit = empty[Math.floor(random() * empty.length)] ?? null;
  }

  function steer(game, heading) {
    if (game.phase !== "running" || !(heading in offsets)) return;
    if (offsets[heading] !== -offsets[game.heading]) game.turn = heading;
  }

  function advance(game) {
    if (game.phase !== "running") return;
    const head = game.body[0];
    game.heading = game.turn;
    const next = head + offsets[game.heading];
    const acrossEdge = Math.abs(next % size - head % size) > 1;
    const eating = next === game.fruit;
    const occupied = eating ? game.body : game.body.slice(0, -1);
    if (next < 0 || next >= size * size || acrossEdge || occupied.includes(next)) {
      game.phase = "lost";
      return;
    }
    if (!eating) game.body.pop();
    game.body.unshift(next);
    if (eating) {
      game.points += 10;
      plant(game);
      if (game.fruit === null) game.phase = "won";
    }
  }

  return { size, start, plant, steer, advance };
})();

if (typeof module !== "undefined") module.exports = SnakeRules;
