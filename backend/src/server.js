import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import chatRoutes from "./routes/chat.route.js"


const app = express();
const PORT = process.env.PORT;


const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://language-chatting-app.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean); // removes undefined/null

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server, Postman, mobile apps
      if (!origin) return callback(null, true);

      // normalize origin (remove trailing slash)
      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        callback(
          new Error(`CORS blocked origin: ${normalizedOrigin}`)
        );
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// app.options("*", cors);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});