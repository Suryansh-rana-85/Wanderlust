const Joi = require('joi');

// Validation Schema for listing
module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        // image: Joi.object({
        //     url: Joi.string().allow("", null),
        // }).required(),

        // this handles both object and string type 
        // images, even when there is a null 
        image: Joi.alternatives().try(
            Joi.object({
                url: Joi.string().allow("", null),
            }),
            Joi.string().allow("", null)
        ).default({ url: "" }),
        
    }).required()
});
// Validation Schema for Reviews
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});