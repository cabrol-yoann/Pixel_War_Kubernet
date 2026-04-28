const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Redis = require("ioredis");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const redis = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

const SIZE = 100;
const GRID_KEY = "grid";

// --------------------
// INIT GRID
// --------------------
async function initGrid() {
  const exists = await redis.exists(GRID_KEY);

  if (!exists) {
    const grid = Array(SIZE * SIZE).fill("white");
    await redis.set(GRID_KEY, JSON.stringify(grid));
  }
}

(async () => {
  await initGrid();
})();

// --------------------
// API GRID
// --------------------
app.get("/grid", async (req, res) => {
  const grid = await redis.get(GRID_KEY);
  res.json(JSON.parse(grid));
});

// --------------------
// SOCKET
// --------------------
io.on("connection", async (socket) => {
  const grid = await redis.get(GRID_KEY);
  socket.emit("init", JSON.parse(grid));

  socket.on("pixel", async ({ index, color }) => {
    if (index < 0 || index >= SIZE * SIZE) return;

    // ⚠️ SAFE UPDATE
    const grid = JSON.parse(await redis.get(GRID_KEY));

    grid[index] = color;

    await redis.set(GRID_KEY, JSON.stringify(grid));

    io.emit("update", { index, color });
  });
});

// --------------------
server.listen(80, () => {
  console.log("Pixel War backend running");
});