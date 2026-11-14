const Campground = require("../models/Campground");
const Booking = require("../models/Booking");

exports.getCampgrounds = async (req, res, next) => {
  let query;

  const reqQuery = { ...req.query };

  const removeFields = ["select", "sort", "page", "limit"];

  removeFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`,
  );
  const filter = JSON.parse(queryStr);

  query = Campground.find(filter);

  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const total = await Campground.countDocuments(filter);

    query = query.skip(startIndex).limit(limit);

    const campgrounds = await query;

    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: campgrounds.length,
      pagination,
      data: campgrounds,
    });
  } catch (err) {
    console.log(err.stack);
    res.status(400).json({ success: false, message: "Cannot find Campgrounds" });
  }
};

exports.getCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
      return res.status(404).json({
        success: false,
        message: `No campground with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, data: campground });
  } catch (err) {
    console.log(err.stack);
    res.status(400).json({ success: false, message: "Cannot find Campground" });
  }
};

exports.createCampground = async (req, res, next) => {
  try {
    const campground = await Campground.create(req.body);
    res.status(201).json({ success: true, data: campground });
  } catch (err) {
    console.log(err.stack);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!campground) {
      return res.status(404).json({
        success: false,
        message: `No campground with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, data: campground });
  } catch (err) {
    console.log(err.stack);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
      return res.status(404).json({
        success: false,
        message: `No campground with the id of ${req.params.id}`,
      });
    }

    await Booking.deleteMany({ campground: req.params.id });
    await Campground.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.log(err.stack);
    res.status(400).json({ success: false, message: "Cannot delete Campground" });
  }
};