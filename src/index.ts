import "dotenv/config";
import express from "express";
import "./db";

import authRouter from "./routes/authRouter";

const app = express();

app.use(express.json());

// Middleware
app.use("/auth", authRouter);
app.use(express.urlencoded({ extended: true }));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
