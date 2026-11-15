const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  checkInDate: {
    type: Date,
    required: [true, "Please add a check-in date"],
  },
  nights: {
    type: Number,
    required: [true, "Please add number of nights"],
    min: [1, "Booking must be at least 1 night"],
    max: [3, "Booking can not be more than 3 nights"],
    validate: {
      validator: Number.isInteger,
      message: "Number of nights must be a whole number",
    },
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  campground: {
    type: mongoose.Schema.ObjectId,
    ref: "Campground",
    required: true,
  },
  totalPrice: {
    type: Number,
    min: 0,
  },
  promotionCode: {
    type: mongoose.Schema.ObjectId,
    ref: "PromotionCode",
    default: null,
  },
  finalPrice: {
    type: Number,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Booking", BookingSchema);