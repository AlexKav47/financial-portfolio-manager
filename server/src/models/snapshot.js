import mongoose from "mongoose";

const snapshotSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true }, // store day timestamp
    totalValue: { type: Number, required: true },
    currency: { type: String, default: "EUR" },
  },
  { timestamps: true }
);

// one snapshot per user per day
snapshotSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("Snapshot", snapshotSchema);
