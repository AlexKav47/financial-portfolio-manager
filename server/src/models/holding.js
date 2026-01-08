import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["stock", "crypto"], required: true },
    symbol: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    avgCost: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

holdingSchema.index({ userId: 1, type: 1, symbol: 1 }, { unique: true });

export default mongoose.model("Holding", holdingSchema);
