import express from "express";
import cors from "cors";
import authRoutes from "./routes/authroutes.js";
import holdingRoutes from "./routes/holdingroutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/holdings", holdingRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;
