const socket = io({
  path: "/socket.io",
  transports: ["websocket"]
});

const SIZE = 100;
let selectedColor = "#ff0000";

const grid = document.getElementById("grid");
const palette = document.getElementById("palette");

const colors = [
  "red", "blue", "green", "yellow",
  "black", "white", "purple", "orange",
  "#00ffff", "#ff00ff", "#00ff00"
];

const container = document.getElementById("container");
const gridEl = document.getElementById("grid");

let scale = 1;
let posX = 0;
let posY = 0;

let isDragging = false;
let startX, startY;

// palette UI
colors.forEach(color => {
  const c = document.createElement("div");
  c.className = "color";
  c.style.background = color;

  c.onclick = () => {
    selectedColor = color;

    document.querySelectorAll(".color").forEach(el => el.classList.remove("active"));
    c.classList.add("active");
  };

  palette.appendChild(c);
});

// grid
let cells = new Array(SIZE * SIZE);

for (let i = 0; i < SIZE * SIZE; i++) {
  const cell = document.createElement("div");
  cell.className = "pixel";

  const x = i % SIZE;
  const y = Math.floor(i / SIZE);

  cell.title = `Index: ${i} — (${x}, ${y})`;

  cell.onclick = () => {
    socket.emit("pixel", {
      index: i,
      color: selectedColor
    });
  };

  grid.appendChild(cell);
  cells[i] = cell;
}

// init
socket.on("init", (gridData) => {
  gridData.forEach((color, i) => {
    if (cells[i]) cells[i].style.background = color;
  });
});

// live update
socket.on("update", ({ index, color }) => {
  if (cells[index]) cells[index].style.background = color;
});

// ZOOM (molette)
container.addEventListener("wheel", (e) => {
  e.preventDefault();

  const zoomIntensity = 0.1;

  if (e.deltaY < 0) {
    scale += zoomIntensity;
  } else {
    scale -= zoomIntensity;
  }

  scale = Math.min(Math.max(0.5, scale), 3); // limite zoom

  applyTransform();
});

// DRAG (clic gauche)
container.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;

  isDragging = true;
  startX = e.clientX - posX;
  startY = e.clientY - posY;

  container.style.cursor = "grabbing";
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  posX = e.clientX - startX;
  posY = e.clientY - startY;

  applyTransform();
});

window.addEventListener("mouseup", () => {
  isDragging = false;
  container.style.cursor = "default";
});

// APPLY TRANSFORM
function applyTransform() {
  gridEl.style.transform =
    `translate(${posX}px, ${posY}px) scale(${scale})`;
  gridEl.style.transformOrigin = "0 0";
}