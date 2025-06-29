const { cloudinary } = require("../cloudConfig.js");
const Listing = require("../models/listing.js");
// mapbox-geocoding
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN; // Access token
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


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
module.exports.createListing = async (req, res) => {
    // Map-Box
    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
        .send()

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    // geocoding coordinates
    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

// Edit 
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_200,w_250");

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// Update
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    console.log(listing);
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        // listing.image = {f
        //     filename: req.file.filename,
        //     url: req.file.path,
        // };
        await listing.save();
        console.log("This is working");
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