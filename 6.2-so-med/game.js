"use strict";

const gridSize = 20;
const bestKey = "snakejs:6.2-so-med:best";
const directions = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const keys = new Map([
  ["arrowup", directions.up], ["w", directions.up],
  ["arrowdown", directions.down], ["s", directions.down],
  ["arrowleft", directions.left], ["a", directions.left],
  ["arrowright", directions.right], ["d", directions.right],
]);

const board = document.querySelector("#board");
const context = board.getContext("2d");
const cell = board.width / gridSize;
const overlay = document.querySelector("#overlay");
const messageTitle = document.querySelector("#message-title");
const messageDetail = document.querySelector("#message-detail");
const scoreDisplay = document.querySelector("#score");
const bestDisplay = document.querySelector("#best");
const statusDisplay = document.querySelector("#status");
const action = document.querySelector("#action");

const messages = {
  ready: ["Aguardando partida", "Pronto para jogar?", "Coma, cresça e desvie das paredes.", "Jogar"],
  playing: ["Em jogo", "", "", "Pausar"],
  paused: ["Em pausa", "Pausa", "Continue quando estiver pronto.", "Continuar"],
  lost: ["Partida encerrada", "Fim de jogo", "", "Jogar novamente"],
  won: ["Partida vencida", "Tabuleiro completo!", "A cobra ocupou todas as casas.", "Jogar novamente"],
};

let state = "ready";
let snake;
let direction;
let turns;
let food;
let score;
let best = readBest();
let timer;
let swipe;

function readBest() {
  try {
    const saved = Number(localStorage.getItem(bestKey));
    return Number.isInteger(saved) && saved >= 0 && saved <= gridSize ** 2 - 3 ? saved : 0;
  } catch {
    return 0;
  }
}

function reset() {
  snake = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
  direction = directions.right;
  turns = [];
  score = 0;
  food = placeFood();
  renderScores();
  draw();
}

function placeFood() {
  const occupied = new Set(snake.map(({ x, y }) => y * gridSize + x));
  const free = [];
  for (let position = 0; position < gridSize ** 2; position++) {
    if (!occupied.has(position)) free.push(position);
  }
  if (free.length === 0) return null;

  const position = free[Math.floor(Math.random() * free.length)];
  return { x: position % gridSize, y: Math.floor(position / gridSize) };
}

function renderScores() {
  scoreDisplay.textContent = String(score).padStart(2, "0");
  bestDisplay.textContent = String(best).padStart(2, "0");
}

function draw() {
  context.fillStyle = "#111a14";
  context.fillRect(0, 0, board.width, board.height);
  context.fillStyle = "#28382c";
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      context.fillRect(x * cell + cell / 2 - 1, y * cell + cell / 2 - 1, 2, 2);
    }
  }

  if (food) {
    const centerX = food.x * cell + cell / 2;
    const centerY = food.y * cell + cell / 2;
    context.fillStyle = "#ff9c83";
    context.beginPath();
    context.moveTo(centerX, centerY - 8);
    context.lineTo(centerX + 8, centerY);
    context.lineTo(centerX, centerY + 8);
    context.lineTo(centerX - 8, centerY);
    context.fill();
  }

  for (const [index, part] of snake.entries()) {
    context.fillStyle = index === 0 ? "#c2fa78" : "#77b84e";
    context.fillRect(part.x * cell + 1, part.y * cell + 1, cell - 2, cell - 2);
  }

  const head = snake[0];
  const eyeX = head.x * cell + cell / 2 - 1 + direction.x * 5;
  const eyeY = head.y * cell + cell / 2 - 1 + direction.y * 5;
  context.fillStyle = "#152314";
  context.fillRect(eyeX + direction.y * 4, eyeY + direction.x * 4, 2, 2);
  context.fillRect(eyeX - direction.y * 4, eyeY - direction.x * 4, 2, 2);
}

function setState(next, detail) {
  clearTimeout(timer);
  state = next;
  const [status, title, defaultDetail, label] = messages[next];
  statusDisplay.textContent = status;
  messageTitle.textContent = title;
  messageDetail.textContent = detail ?? defaultDetail;
  action.textContent = label;
  overlay.hidden = next === "playing";
  if (next === "playing") scheduleStep();
}

function scheduleStep() {
  timer = setTimeout(step, Math.max(65, 165 - score * 4));
}

function samePosition(a, b) {
  return a.x === b.x && a.y === b.y;
}

function step() {
  direction = turns.shift() ?? direction;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize) {
    setState("lost", "A cobra bateu na parede.");
    return;
  }

  const eats = samePosition(head, food);
  // A cauda libera sua casa no mesmo passo quando a cobra não cresce.
  const body = eats ? snake : snake.slice(0, -1);
  if (body.some((part) => samePosition(head, part))) {
    setState("lost", "A cobra bateu no próprio corpo.");
    return;
  }

  snake.unshift(head);
  if (eats) {
    score++;
    if (score > best) {
      best = score;
      try {
        localStorage.setItem(bestKey, String(best));
      } catch {
        // O placar continua funcionando durante a sessão.
      }
    }
    food = placeFood();
    renderScores();
  } else {
    snake.pop();
  }

  draw();
  if (food) scheduleStep();
  else setState("won");
}

function queueDirection(next) {
  if (state !== "playing" || turns.length === 2) return;
  const last = turns.at(-1) ?? direction;
  // Só aceite curvas de 90 graus, inclusive entre duas curvas enfileiradas.
  if (last.x * next.x + last.y * next.y === 0) turns.push(next);
}

function toggleGame() {
  if (state === "playing") {
    setState("paused");
    return;
  }
  if (state !== "paused") reset();
  setState("playing");
}

action.addEventListener("click", toggleGame);

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  const next = keys.get(event.key.toLowerCase());
  if (next) {
    event.preventDefault();
    if (!event.repeat) queueDirection(next);
  } else if (event.code === "Space") {
    if (event.target instanceof HTMLButtonElement && event.target !== action) return;
    event.preventDefault();
    if (!event.repeat) toggleGame();
  }
});

for (const button of document.querySelectorAll("[data-direction]")) {
  button.addEventListener("click", () => queueDirection(directions[button.dataset.direction]));
}

board.parentElement.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary || event.pointerType === "mouse" || state !== "playing") return;
  event.currentTarget.setPointerCapture(event.pointerId);
  swipe = { x: event.clientX, y: event.clientY, id: event.pointerId };
});

board.parentElement.addEventListener("pointerup", (event) => {
  if (event.pointerId !== swipe?.id) return;
  const dx = event.clientX - swipe.x;
  const dy = event.clientY - swipe.y;
  swipe = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
  const next = Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? directions.right : directions.left)
    : (dy > 0 ? directions.down : directions.up);
  queueDirection(next);
});

board.parentElement.addEventListener("lostpointercapture", (event) => {
  if (event.pointerId === swipe?.id) swipe = null;
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && state === "playing") setState("paused");
});

reset();
