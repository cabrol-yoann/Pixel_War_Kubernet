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
  host: "redis",
  port: 6379
});

const SIZE = 100;

// init grid if not exists
async function initGrid() {
  const exists = await redis.exists("grid");
  if (!exists) {
    const grid = Array(SIZE * SIZE).fill("white");
    await redis.set("grid", JSON.stringify(grid));
  }
}
initGrid();

app.get("/grid", async (req, res) => {
  const grid = await redis.get("grid");
  res.json(JSON.parse(grid));
});

io.on("connection", async (socket) => {
  const grid = await redis.get("grid");
  socket.emit("init", JSON.parse(grid));

  socket.on("pixel", async ({ index, color }) => {
    const grid = JSON.parse(await redis.get("grid"));

    if (index < 0 || index >= grid.length) return;

    grid[index] = color;

    await redis.set("grid", JSON.stringify(grid));

    io.emit("update", { index, color });
  });
});

server.listen(80, () => {
  console.log("Production Pixel War backend running");
});