import express from "express";
import cors from "cors";
import "dotenv/config";
import graphRoutes from "./routes/graphRoutes.js";
import { errorHandler } from "./controllers/graphController.js";
import { closeDriver } from "./config/db.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
    : true
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get("/", (req, res) => {
  res.json({
    name: "DevPath API",
    status: "running"
  });
});

app.use("/api", graphRoutes);
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`DevPath API running on http://localhost:${port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Closing database connection...`);
  server.close(async () => {
    await closeDriver();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
