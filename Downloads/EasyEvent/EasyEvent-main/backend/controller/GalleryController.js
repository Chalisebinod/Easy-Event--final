const Gallery = require("../model/Gallery");
const fs = require("fs");
const path = require("path");

exports.uploadImages = async (req, res) => {
  try {
    const images = req.files.map((file) => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
    }));

    let gallery = await Gallery.findOne({ venueOwnerId: req.user.id });

    if (!gallery) {
      gallery = new Gallery({ venueOwnerId: req.user.id, images });
    } else {
      gallery.images.push(...images);
    }

    await gallery.save();
    res.status(200).json({ success: true, gallery });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

exports.getGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findOne({ venueOwnerId: req.user.id });
    if (!gallery) return res.status(404).json({ message: "No gallery found" });
    res.status(200).json(gallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteImage = async (req, res) => {
  const { imageId } = req.params;
  try {
    const gallery = await Gallery.findOne({ venueOwnerId: req.user.id });
    if (!gallery) return res.status(404).json({ message: "Gallery not found" });

    const image = gallery.images.id(imageId);
    if (!image) return res.status(404).json({ message: "Image not found" });

    const filePath = path.join(__dirname, "../uploads/", image.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    image.remove();
    await gallery.save();
    res.status(200).json({ message: "Image deleted", gallery });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAllImages = async (req, res) => {
  try {
    const gallery = await Gallery.findOne({ venueOwnerId: req.user.id });
    if (!gallery) return res.status(404).json({ message: "Gallery not found" });

    gallery.images.forEach((img) => {
      const filePath = path.join(__dirname, "../uploads/", img.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    gallery.images = [];
    await gallery.save();
    res.status(200).json({ message: "All images deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
