const Listing = require("../models/listing");
const Review = require("../models/review");

// Post Review 
module.exports.createReview = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();  // Save the review first
    await listing.save();  // Then save the listing
    console.log(listing);
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
};

// Delete Review
module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};