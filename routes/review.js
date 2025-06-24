const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js"); // error handling
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listings.js");
const { validateReview, isLoggedIn } = require("../middleware.js");


// Post Review Route
router.post("/", 
    isLoggedIn, 
    validateReview, 
    wrapAsync(async (req, res) => {
        const listing = await Listing.findById(req.params.id);
        let newReview = new Review(req.body.review);
        newReview.author = req.user._id;

        console.log("New review added");
        listing.reviews.push(newReview);
        console.log(newReview);
        
        await newReview.save();  // Save the review first
        await listing.save();  // Then save the listing
        
        req.flash("success", "New Review Created!");
        res.redirect(`/listings/${listing._id}`);
}));

// router.post(
//   "/",
//   isLoggedIn,
//   validateReview,
//   wrapAsync(async (req, res) => {
//     const listing = await Listing.findById(req.params.id);
//     if (!listing) {
//       req.flash("error", "Listing not found.");
//       return res.redirect("/listings");
//     }

//     const newReview = new Review(req.body.review);
//     newReview.author = req.user._id;
//     console.log(`before push ${listing.reviews}`);
//     listing.reviews.push(newReview);
//     console.log(`after push ${listing.reviews}`)

//     await newReview.save();
//     await listing.save();

//     req.flash("success", "New Review Created!");
//     res.redirect(`/listings/${listing._id}`); 
//   })
// );

// Delete Review Route 
router.delete(
    "/:reviewId", 
    wrapAsync(async(req, res) => {
        let { id, reviewId } = req.params;

        await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId} });
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Review Deleted!");
        res.redirect(`/listings/${id}`);
    })
);

module.exports = router;