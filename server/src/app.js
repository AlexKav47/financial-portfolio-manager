import express from "express";
import cors from "cors";
import authRoutes from "./routes/authroutes.js";
import holdingRoutes from "./routes/holdingroutes.js";
import portfolioRoutes from "./routes/portfolioroutes.js";
import transactionRoutes from "./routes/transactionroutes.js";
import snapshotRoutes from "./routes/snapshotRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/holdings", holdingRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/snapshots", snapshotRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;
