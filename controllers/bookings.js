const Booking = require("../models/Booking");
const Campground = require("../models/Campground");

const campgroundFields = {
  path: "campground",
  select: "name address tel",
};

const isBookingOwner = (booking, user) =>
  booking.user.toString() === user.id;

const isDateBeforeToday = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date) < today;
};

exports.getBookings = async (req, res, next) => {
  const filter = { user: req.user.id };

  try {
    const bookings = await Booking.find(filter).populate(campgroundFields);

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
    const booking = await Booking.findById(req.params.id).populate(
      campgroundFields,
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    if (!isBookingOwner(booking, req.user)) {
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

    const { checkInDate, nights } = req.body;

    if (isDateBeforeToday(checkInDate)) {
      return res.status(400).json({
        success: false,
        message: "Check-in date can not be in the past",
      });
    }

    const booking = await Booking.create({
      checkInDate,
      nights,
      user: req.user.id,
      campground: campground._id,
    });

    await booking.populate(campgroundFields);

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.log(error.stack);
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res
      .status(500)
      .json({ success: false, message: "Cannot create Booking" });
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    if (!isBookingOwner(booking, req.user)) {
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

    if (campgroundId !== undefined) {
      const campground = await Campground.findById(campgroundId);
      if (!campground) {
        return res.status(404).json({
          success: false,
          message: `No campground with the id of ${campgroundId}`,
        });
      }
      booking.campground = campground._id;
    }

    await booking.save();
    await booking.populate(campgroundFields);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.log(error.stack);
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res
      .status(500)
      .json({ success: false, message: "Cannot update Booking" });
  }
};