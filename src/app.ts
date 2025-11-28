import express, { Express, urlencoded } from "express";
import { createServer } from "http";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { Server } from "socket.io";
import { postProduct } from "./controllers/post.controller";
import { upload } from "./middlewares/multer.middleware";

const app: Express = express();
export const server = createServer(app);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? process.env.CORS_ORIGIN : "*",
  })
);

export const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production" ? process.env.CORS_ORIGIN : "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json({ limit: "1mb" }));
app.use(urlencoded({ extended: true }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

io.on("connection", (socket) => {
  console.log(`A client with socket id ${socket.id} connected`);

  // Shopkeeper joins their specific shop category room
  socket.on("join-shop-category", (data: { category: string }) => {
    socket.join(data.category);
    console.log(`Socket ${socket.id} joined category: ${data.category}`);
    // Acknowledge the joining
    socket.emit("joined-category",` You have joined category: ${data.category}`);
  });
});

app.post("/api/product",upload.single("productImage"), postProduct);

