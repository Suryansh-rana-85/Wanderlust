const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listings.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");


// console.log("Listings router loaded");

// Index Route
router.get(
    "/",
    wrapAsync(async (req, res) => {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    })
);

// New Route
router.get("/new", 
    isLoggedIn("You must be logged in to create a listing!"),
    (req, res) => {
        res.render("listings/new.ejs");
});

// Show Route 
router.get(
    "/:id",
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id)
            .populate({     // author with each review
                path: "reviews", 
                populate: { 
                    path: "author",
                }
            })
            .populate("owner");
        if(!listing) {
            req.flash("error", "Listing you requested for does not exist!");
            return res.redirect("/listings");
        }
        console.log(listing.reviews);
        res.render("listings/show.ejs", { listing });
}));

// Create Route 
router.post(
    "/", 
    isLoggedIn("You must be logged in to create a listing!"),
    validateListing,
    wrapAsync(async (req, res, next) => {
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id; // add owner
        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    })
 );

// Edit Route 
router.get(
    "/:id/edit",
    isLoggedIn("You must be logged in to edit listing!"),
    isOwner,
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        if(!listing) {
            req.flash("error", "Listing you requested for does not exist!");
            return res.redirect("/listings");
        }
        res.render("listings/edit.ejs", { listing });
}));

// Update Route 
router.put(
    "/:id",
    isLoggedIn("You must be logged in to edit listing!"),
    isOwner,
    validateListing,
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    })
);

// Delete Route 
router.delete("/:id", 
    isLoggedIn("You must be logged in to delete a listing!"), 
    isOwner,
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        req.flash("success", "Listing Deleted!");
        res.redirect("/listings");
}));

module.exports = router;