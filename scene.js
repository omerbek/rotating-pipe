'use strict';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const mint = '#9ef4dc';
const amber = '#ffcb7d';
const ink = '#152129';
const duration = 8;

function rect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function line(points, color = mint, width = 3) {
  ctx.beginPath();
  points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

const range = length => Array.from({length}, (_, index) => index);

function render(t) {
  const project = ([x, y, z]) => {
    const angle = t * Math.PI / 4;
    const depth = z * Math.cos(angle) - x * Math.sin(angle);
    const scale = 275 / (300 + depth);
    return [360 + (x * Math.cos(angle) + z * Math.sin(angle)) * scale, 204 + y * scale];
  };
  const ring = z => range(25).map(i => [72 * Math.cos(i * Math.PI / 12), 72 * Math.sin(i * Math.PI / 12), z]);
  const rings = [ring(-75), ring(75)];
  rings.forEach(points => line(points.map(project)));
  range(8).forEach(i => line(rings.map(points => project(points[i * 3])), amber, 2));
}

const seek = document.querySelector('#seek');
const play = document.querySelector('#play');
const time = document.querySelector('#time');
let position = 0;
let playing = false;
let previous = null;
let animationId = null;

function draw() {
  rect(0, 0, canvas.width, canvas.height, ink);
  render(position);
  seek.value = position;
  time.value = `${position.toFixed(2)} sn`;
}

function frame(timestamp) {
  if (!playing) return;
  if (previous !== null) position = (position + (timestamp - previous) / 1000) % duration;
  previous = timestamp;
  draw();
  animationId = requestAnimationFrame(frame);
}

play.addEventListener('click', () => {
  playing = !playing;
  play.textContent = playing ? 'Duraklat' : 'Oynat';
  if (playing) {
    previous = null;
    animationId = requestAnimationFrame(frame);
  } else {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
});

seek.addEventListener('input', () => {
  position = Number(seek.value);
  draw();
});

draw();
