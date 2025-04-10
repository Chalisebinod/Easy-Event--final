const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  uploadImages,
  getGallery,
  deleteImage,
  deleteAllImages,
} = require("../controller/GalleryController");

const {
  checkAuthentication,
  checkIsVenueOwner,
} = require("../middleware/middleware");

// Setup multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "backend/uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// Routes
router.post(
  "/upload",
  checkAuthentication,
  checkIsVenueOwner,
  upload.array("images", 10),
  uploadImages
);

router.get(
  "/my-gallery",
  checkAuthentication,
  checkIsVenueOwner,
  getGallery
);

router.delete(
  "/delete/:imageId",
  checkAuthentication,
  checkIsVenueOwner,
  deleteImage
);

router.delete(
  "/delete-all",
  checkAuthentication,
  checkIsVenueOwner,
  deleteAllImages
);

module.exports = router;
