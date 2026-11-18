'use strict';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const mint = '#9ef4dc';
const amber = '#ffcb7d';
const ink = '#152129';
const duration = 8;
const controls = [...document.querySelectorAll('#settings input')];
const settings = Object.fromEntries(controls.map(input => [
  input.id, input.type === 'number' ? Number(input.value) : input.value
]));
controls.forEach(input => input.addEventListener('input', () => {
  if (input.type === 'number' && (input.value === '' || !input.validity.valid)) return;
  settings[input.id] = input.type === 'number' ? input.valueAsNumber : input.value;
  draw();
}));

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
    const angle = t * Math.PI * settings.rotations / 4;
    const depth = z * Math.cos(angle) - x * Math.sin(angle);
    const scale = 275 / (300 + depth);
    return [360 + (x * Math.cos(angle) + z * Math.sin(angle)) * scale, 204 + y * scale];
  };
  const ring = z => range(25).map(i => [settings.radius * Math.cos(i * Math.PI / 12), settings.radius * Math.sin(i * Math.PI / 12), z]);
  const rings = [ring(-settings.length / 2), ring(settings.length / 2)];
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
  time.value = `${position.toFixed(2)} ${language === 'en' ? 's' : 'sn'}`;
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
  updatePlaybackLabel();
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

document.querySelector('#save').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'rotating-pipe.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

const copy = {"title": ["Dönen boru kesiti", "Rotating Pipe"], "description": ["Perspektif projeksiyonunda boru geometrisini döndür.", "Adjust pipe radius, length and rotation speed in a perspective preview."], "preview": ["Seçili hareket deneyinin önizlemesi", "Animation preview"], "timeline": ["Zaman çizelgesi", "Timeline"], "settings": ["Sahne ayarları", "Scene settings"], "save": ["PNG indir", "Download PNG"], "radius": ["Boru yarıçapı", "Pipe radius"], "length": ["Boru uzunluğu", "Pipe length"], "rotations": ["8 saniyedeki dönüş", "Rotations in 8 seconds"]};
const dictionary = {"Debi": "Flow", "ÇIKIŞ DEBİSİ": "OUTLET FLOW", "Normal çalışma": "Operating normally", "Ölçüm birimi görünür": "Unit is visible", "Durum etiketi okunur": "Status label is legible", "Geçiş sekiz saniyeye sığar": "Transition fits in eight seconds", "SU AKIŞI": "WATER FLOW", "Yalova · Su istasyonu": "Yalova · Water station", "İstasyon": "Station", "Komut": "Prompt", "Tohum": "Seed", "Örnekle": "Sample", "Çıktı": "Output", "Suyu sarı bir uyarı çizgisiyle anlat.": "Show the water as a yellow alert line.", "Akışı camgöbeği bir dalgaya dönüştür.": "Turn the flow into a cyan wave.", "Veriyi noktalardan oluşan bir haritaya işle.": "Map the data as a field of dots.", "Akış": "Flow", "Ölçüm": "Reading", "Mavi saat": "Blue hour", "Bakır günbatımı": "Copper sunset", "Yeşil şafak": "Green dawn", "Kare": "Frame", "Oynat": "Play", "Duraklat": "Pause"};
const fieldDefaults = {};
let language = 'tr';
function translate(value) {
  return language === 'en' ? (Object.hasOwn(dictionary, value) ? dictionary[value] : value) : value;
}
function updatePlaybackLabel() {
  play.textContent = translate(playing ? 'Duraklat' : 'Oynat');
}
function setLanguage(next) {
  const previousLanguage = language;
  language = next;
  document.documentElement.lang = next;
  const index = next === 'en' ? 1 : 0;
  document.title = copy.title[index];
  for (const item of document.querySelectorAll('[data-i18n]')) item.textContent = copy[item.dataset.i18n][index];
  for (const item of document.querySelectorAll('[data-i18n-label]')) item.setAttribute('aria-label', copy[item.dataset.i18nLabel][index]);
  for (const code of ['tr', 'en']) document.querySelector('#lang-' + code).setAttribute('aria-pressed', String(code === next));
  if (previousLanguage !== next) {
    for (const field of document.querySelectorAll('#settings input[type="text"]')) {
      const original = field.defaultValue;
      const english = Object.hasOwn(fieldDefaults, original) ? fieldDefaults[original] : original;
      if (field.value === (previousLanguage === 'en' ? english : original)) {
        field.value = next === 'en' ? english : original;
        field.dispatchEvent(new Event('input'));
      }
    }
  }
  updatePlaybackLabel();
  draw();
}
for (const code of ['tr', 'en']) document.querySelector('#lang-' + code).addEventListener('click', () => setLanguage(code));

setLanguage('tr');
