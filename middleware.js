const Listing = require("./models/listings");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");


// returns middleware
module.exports.isLoggedIn = (customMessage) => {
    return (req, res, next) => {
        if (!req.isAuthenticated()) {
            req.session.redirectUrl = req.originalUrl;
            req.flash("error", customMessage || "You must be logged in to create a listing!");
            return res.redirect("/login");
        }
        next();
    };
};

// save redirectUrl in locals
module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// Owner
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    };
    next();
};

// validate listing - JOI
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body); 
    if (error) {
        let errMsg = error.details.map(
            (el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// validate reviews- Joi
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);  
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};
