const Booking = require("../models/Booking");
const Campground = require("../models/Campground");
const PromotionCode = require("../models/PromotionCode");

const campgroundFields = {
  path: "campground",
  select: "name address tel pricePerNight",
};

const promotionCodeFields = {
  path: "promotionCode",
  select: "code discountRate expireDate",
};

const isBookingOwnerOrAdmin = (booking, user) =>
  booking.user.toString() === user.id || user.role === "admin";

const isDateBeforeToday = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date) < today;
};

const hasValidPricePerNight = (campground) =>
  typeof campground.pricePerNight === "number" &&
  Number.isFinite(campground.pricePerNight);

const calculateTotalPrice = (pricePerNight, nights) => pricePerNight * nights;

const calculateFinalPrice = (totalPrice, discountRate) =>
  Math.round(totalPrice * (1 - discountRate) * 100) / 100;

const findValidPromotionCode = async (code) => {
  const promotionCode = await PromotionCode.findOne({
    code: String(code).trim().toUpperCase(),
  });

  if (!promotionCode) {
    return { error: `Promotion code ${code} does not exist` };
  }

  if (promotionCode.expireDate < new Date()) {
    return { error: `Promotion code ${code} has expired` };
  }

  return { promotionCode };
};

exports.getBookings = async (req, res, next) => {
  let filter = {};

  if (req.user.role !== "admin") {
    filter = { user: req.user.id };
  } else if (req.params.campgroundId) {
    filter = { campground: req.params.campgroundId };
  }

  try {
    const bookings = await Booking.find(filter)
      .populate(campgroundFields)
      .populate(promotionCodeFields);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Booking" });
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate(campgroundFields)
      .populate(promotionCodeFields);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    if (!isBookingOwnerOrAdmin(booking, req.user)) {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to view this booking`,
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Booking" });
  }
};

exports.addBooking = async (req, res, next) => {
  try {
    const campgroundId = req.params.campgroundId || req.body.campground;
    const campground = await Campground.findById(campgroundId);

    if (!campground) {
      return res.status(404).json({
        success: false,
        message: `No campground with the id of ${campgroundId}`,
      });
    }

    const { checkInDate, nights, promotionCode: code } = req.body;

    if (isDateBeforeToday(checkInDate)) {
      return res.status(400).json({
        success: false,
        message: "Check-in date can not be in the past",
      });
    }

    let promotionCode = null;
    if (code) {
      const result = await findValidPromotionCode(code);
      if (result.error) {
        return res.status(400).json({ success: false, message: result.error });
      }
      promotionCode = result.promotionCode;
    }

    if (!hasValidPricePerNight(campground)) {
      return res.status(400).json({
        success: false,
        message: "Campground pricePerNight is not configured",
      });
    }

    const totalPrice = calculateTotalPrice(campground.pricePerNight, nights);
    const finalPrice = calculateFinalPrice(
      totalPrice,
      promotionCode ? promotionCode.discountRate : 0,
    );

    const booking = await Booking.create({
      checkInDate,
      nights,
      user: req.user.id,
      campground: campground._id,
      totalPrice,
      promotionCode: promotionCode ? promotionCode._id : null,
      finalPrice,
    });

    await booking.populate([campgroundFields, promotionCodeFields]);

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot create Booking" });
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      promotionCodeFields,
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    if (!isBookingOwnerOrAdmin(booking, req.user)) {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this booking`,
      });
    }

    const { checkInDate, nights, campground: campgroundId } = req.body;

    if (checkInDate !== undefined) {
      if (isDateBeforeToday(checkInDate)) {
        return res.status(400).json({
          success: false,
          message: "Check-in date can not be in the past",
        });
      }
      booking.checkInDate = checkInDate;
    }

    if (nights !== undefined) {
      booking.nights = nights;
    }

    const targetCampgroundId = campgroundId || booking.campground;
    const campground = await Campground.findById(targetCampgroundId);
    if (!campground) {
      return res.status(404).json({
        success: false,
        message: `No campground with the id of ${targetCampgroundId}`,
      });
    }
    if (!hasValidPricePerNight(campground)) {
      return res.status(400).json({
        success: false,
        message: "Campground pricePerNight is not configured",
      });
    }
    booking.campground = campground._id;

    let promotionCode = booking.promotionCode;
    if (req.body.promotionCode === null || req.body.promotionCode === "") {
      promotionCode = null;
    } else if (req.body.promotionCode !== undefined) {
      const result = await findValidPromotionCode(req.body.promotionCode);
      if (result.error) {
        return res.status(400).json({ success: false, message: result.error });
      }
      promotionCode = result.promotionCode;
    }
    booking.promotionCode = promotionCode ? promotionCode._id : null;

    booking.totalPrice = calculateTotalPrice(
      campground.pricePerNight,
      booking.nights,
    );
    booking.finalPrice = calculateFinalPrice(
      booking.totalPrice,
      promotionCode ? promotionCode.discountRate : 0,
    );

    await booking.save();
    await booking.populate([campgroundFields, promotionCodeFields]);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update Booking" });
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    if (!isBookingOwnerOrAdmin(booking, req.user)) {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this booking`,
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete Booking" });
  }
};