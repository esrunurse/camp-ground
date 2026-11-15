const PromotionCode = require("../models/PromotionCode");
const Booking = require("../models/Booking");

exports.getPromotionCodes = async (req, res, next) => {
  try {
    const promotionCodes = await PromotionCode.find().sort("-createdAt");

    res.status(200).json({
      success: true,
      count: promotionCodes.length,
      data: promotionCodes,
    });
  } catch (err) {
    console.log(err.stack);
    res
      .status(400)
      .json({ success: false, message: "Cannot find Promotion Codes" });
  }
};

exports.getPromotionCode = async (req, res, next) => {
  try {
    const promotionCode = await PromotionCode.findById(req.params.id);

    if (!promotionCode) {
      return res.status(404).json({
        success: false,
        message: `No promotion code with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, data: promotionCode });
  } catch (err) {
    console.log(err.stack);
    res
      .status(400)
      .json({ success: false, message: "Cannot find Promotion Code" });
  }
};

exports.createPromotionCode = async (req, res, next) => {
  try {
    const { code, discountRate, expireDate } = req.body;

    const promotionCode = await PromotionCode.create({
      code,
      discountRate,
      expireDate,
    });

    res.status(201).json({ success: true, data: promotionCode });
  } catch (err) {
    console.log(err.stack);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updatePromotionCode = async (req, res, next) => {
  try {
    const { code, discountRate, expireDate } = req.body;

    const promotionCode = await PromotionCode.findByIdAndUpdate(
      req.params.id,
      { code, discountRate, expireDate },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!promotionCode) {
      return res.status(404).json({
        success: false,
        message: `No promotion code with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, data: promotionCode });
  } catch (err) {
    console.log(err.stack);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deletePromotionCode = async (req, res, next) => {
  try {
    const promotionCode = await PromotionCode.findById(req.params.id);

    if (!promotionCode) {
      return res.status(404).json({
        success: false,
        message: `No promotion code with the id of ${req.params.id}`,
      });
    }

    const bookingsUsingCode = await Booking.countDocuments({
      promotionCode: req.params.id,
    });

    if (bookingsUsingCode > 0) {
      return res.status(400).json({
        success: false,
        message: `Promotion code is used by ${bookingsUsingCode} booking(s), set its expireDate to stop new use instead`,
      });
    }

    await promotionCode.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.log(err.stack);
    res
      .status(400)
      .json({ success: false, message: "Cannot delete Promotion Code" });
  }
};
