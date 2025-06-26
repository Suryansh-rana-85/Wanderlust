const { cloudinary } = require("../cloudConfig.js");
const Listing = require("../models/listing.js");

// Index
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

// New form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// Show
module.exports.showListing = async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate({
            path: "reviews",
            populate: { path: "author" }
        })
        .populate("owner");

    if (listing.length === 0 && !listing) {
        req.flash("error", "Listing not found or has no reviews.");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

// Create 
// module.exports.createListing = async (req, res, next) => {
//     let url = req.file.path;
//     let filename = req.file.filename;

//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id; // add owner
//     newListing.image[url] = { url, filename };
//     await newListing.save();
//     req.flash("success", "New Listing Created!");
//     res.redirect("/listings");
// // };
// module.exports.createListing = async (req, res, next) => {
//     const { url, filename } = req.file;

//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;
//     newListing.image = { url, filename };
//     await newListing.save();
//     console.log(res);
//     cloudinary.uploader.upload();

//     req.flash("success", "New Listing Created!");
//     res.redirect("/listings");
// };
module.exports.createListing = async (req, res, next) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  // Fix this part
  if (req.file) {
    newListing.image = {
      url: req.file.path,       // Multer + Cloudinary automatically adds this
      filename: req.file.filename
    };
  }
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

// Edit 
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (listing.length === 0 && !listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
};

// Update
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    // upload image in edit form
    if(typeof req.file !== "undefined") {
        listing.image = {
            filename: req.file.filename,
            url: req.file.path,
        };
        await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// Delete
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};