import mongoose from "mongoose";

/**
 * Defines the structure of an investment record within the MongoDB collection
 */
const holdingSchema = new mongoose.Schema(
  {
    // Reference to the owning user with indexing for query optimization
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Discriminator to distinguish between equity and digital asset classes
    type: {
      type: String,
      enum: ["stock", "crypto"],
      required: true,
    },

    // Normalized ticker identifier stored in uppercase for consistency
    symbol: {
      type: String,
      required: true,
      trim: true,
      set: (v) => String(v || "").toUpperCase(),
    },

    // External provider identifier for CoinGecko used to ensure pricing accuracy
    cgId: {
      type: String,
      default: null,
      trim: true,
    },

    // Total units held for the specific asset
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    // Weighted average purchase price used for cost basis calculations
    avgCost: {
      type: Number,
      required: true,
      min: 0,
    },

    // Persisted market value to provide fallback data during API rate-limiting events
    latestPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    // Timestamp indicating the freshness of the cached latestPrice
    priceLastUpdated: {
      type: Date,
      default: null,
    },
  },
  // Automatically manage createdAt and updatedAt fields
  { timestamps: true }
);

/**
 * Enforce unique constraints to prevent redundant records for the same asset per user
 */
holdingSchema.index({ userId: 1, type: 1, symbol: 1 }, { unique: true });

export default mongoose.model("Holding", holdingSchema);