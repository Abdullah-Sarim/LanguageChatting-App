import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    rater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ratedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

ratingSchema.index({ rater: 1, ratedUser: 1 }, { unique: true });

const Rating = mongoose.model("Rating", ratingSchema);

export default Rating;
