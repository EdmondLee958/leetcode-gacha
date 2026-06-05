console.log("starting server...");

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import testRoutes from "./routes/test.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use(testRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.log(err));