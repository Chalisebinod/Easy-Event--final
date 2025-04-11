const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema({
  venueOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VenueOwner",
    required: true,
  },
  images: [
    {
      url: String,
      filename: String,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Gallery", gallerySchema);
