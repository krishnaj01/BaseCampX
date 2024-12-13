const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema; //shortening mongoose.Schema

const ImageSchema = new Schema({
    url: String,
    filename: String
});


// https://res.cloudinary.com/dcee2af8z/image/upload/v1733768979/BaseCampX/r83qcnxu9x8ebhgqcitz.jpg
// replacing the above with below to make the image width change as per the transformations allowed by cloudinary using MongoDB Schema virtuals
// https://res.cloudinary.com/dcee2af8z/image/upload/w_200/v1733768979/BaseCampX/r83qcnxu9x8ebhgqcitz.jpg

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };
// By default, Mongoose does not include virtuals when you convert a document to JSON. For example, if you pass a document to Express' res.json() function, virtuals will not be included by default.

// To include virtuals in res.json(), you need to set the toJSON schema option to { virtuals: true }.

const CampgroundSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    images: [ImageSchema],
    description: {
        type: String
    },
    location: {
        type: String,
        required: true
    },
    geometry: {
        type: {
          type: String,
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);


CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><h6><a href="/campgrounds/${this._id}">${this.title}</a></h6></strong><p>${this.location}</p>`;
});


//mongoose middleware
CampgroundSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

CampgroundSchema.pre("deleteMany", async function (next) {
    const queryConditions = this.getQuery();
    const campgrounds = await this.model.find(queryConditions);

    for (let campground of campgrounds) {
        await Review.deleteMany({
            _id: {
                $in: campground.reviews
            }
        });
    }
    next();
});

//important to make it a model
const Campground = mongoose.model('Campground', CampgroundSchema); //by the above I mean this line
module.exports = Campground;