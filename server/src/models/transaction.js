import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    kind: {
      type: String,
      enum: ["deposit", "withdrawal", "buy", "sell"],
      required: true,
    },

    // Asset fields only relevant for buy and sell
    assetType: { type: String, enum: ["stock", "crypto"], default: null },
    symbol: { type: String, default: null, trim: true },

    quantity: { type: Number, default: null, min: 0 },
    price: { type: Number, default: null, min: 0 },
    fees: { type: Number, default: 0, min: 0 },

    // Direct cash flow amount for deposit or withdrawal in EUR
    amount: { type: Number, default: null },

    // Canonical cash flow used for IRR computed at creation time
    // Convention negative = money invested, positive = money received
    cashFlow: { type: Number, required: true },

    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
