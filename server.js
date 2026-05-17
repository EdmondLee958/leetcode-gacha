console.log("starting server...");
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

import testRoutes from "./routes/test.js";

app.use(express.json());

app.use(testRoutes);


app.use(cors());


// test route
app.get("/", (req, res) => {
  res.send("API is running");
});

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.log(err));