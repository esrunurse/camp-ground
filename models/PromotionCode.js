const mongoose = require("mongoose");

const PromotionCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Please add a promotion code"],
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountRate: {
    type: Number,
    required: [true, "Please add a discount rate"],
    min: [0, "Discount rate can not be less than 0"],
    max: [1, "Discount rate can not be more than 1"],
  },
  expireDate: {
    type: Date,
    required: [true, "Please add an expiration date"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PromotionCode", PromotionCodeSchema);
