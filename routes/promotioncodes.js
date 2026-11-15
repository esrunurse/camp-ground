const express = require("express");
const {
  getPromotionCodes,
  getPromotionCode,
  createPromotionCode,
  updatePromotionCode,
  deletePromotionCode,
} = require("../controllers/promotioncodes");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("admin"));

router.route("/").get(getPromotionCodes).post(createPromotionCode);
router
  .route("/:id")
  .get(getPromotionCode)
  .put(updatePromotionCode)
  .delete(deletePromotionCode);

module.exports = router;
