"use strict";

const field = document.querySelector("#field");
const cover = document.querySelector("#cover");
const startButton = document.querySelector("#start");
const points = document.querySelector("#points");
const gameKeys = new Map([
  ["ArrowUp", "north"], ["ArrowDown", "south"], ["ArrowLeft", "west"], ["ArrowRight", "east"],
  ["w", "north"], ["s", "south"], ["a", "west"], ["d", "east"],
]);

field.style.setProperty("--size", SnakeRules.size);
const cells = Array.from({ length: SnakeRules.size ** 2 }, () => field.appendChild(document.createElement("i")));
let game = SnakeRules.start();
let timer;

function paint() {
  for (const cell of cells) cell.className = "";
  for (const part of game.body) cells[part].className = "body";
  cells[game.body[0]].className = "head";
  if (game.fruit !== null) cells[game.fruit].className = "fruit";
  points.textContent = game.points;
}

function tick() {
  SnakeRules.advance(game);
  paint();
  if (game.phase === "running") return;
  clearInterval(timer);
  document.querySelector("#title").textContent = game.phase === "won" ? "Pomar completo!" : "Fim da partida";
  document.querySelector("#caption").textContent = "Sua colheita rendeu " + game.points + " pontos.";
  startButton.textContent = "Jogar novamente";
  cover.hidden = false;
  startButton.focus();
}

startButton.addEventListener("click", () => {
  if (game.phase === "running") return;
  game = SnakeRules.start();
  SnakeRules.plant(game);
  game.phase = "running";
  cover.hidden = true;
  paint();
  timer = setInterval(tick, 175);
});

document.addEventListener("keydown", event => {
  const direction = gameKeys.get(event.key) ?? gameKeys.get(event.key.toLowerCase());
  if (!direction || game.phase !== "running" || event.ctrlKey || event.metaKey || event.altKey) return;
  event.preventDefault();
  SnakeRules.steer(game, direction);
});

for (const button of document.querySelectorAll("[data-turn]")) {
  button.addEventListener("click", () => SnakeRules.steer(game, button.dataset.turn));
}

SnakeRules.plant(game);
paint();
