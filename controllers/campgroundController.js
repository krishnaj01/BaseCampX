const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res) => {
    // if(!req.body.campground) throw new ExpressError(400, 'Invalid Campground Data');  // --> our logic to check whether the campground object is there or not

    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    
    //if no coordinates found
    if (!geoData.body.features.length) {
        req.flash('error', 'Location not found!');
        return res.redirect('/campgrounds/new')
    }

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry; // the data received is in the form of GeoJSON  //we get an array of coordinates where it is of the form of [longitude, latitude]
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;

    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    if (!campground) {
        req.flash('error', 'Cannot find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const updatedCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true, runValidators: true });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    updatedCampground.images.push(...imgs);

    //checking if location has changed
    if (req.body.campground.location != campground.location) {
        const geoData = await geocoder.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        }).send()

        //if no coordinates found
        if (!geoData.body.features.length) {
            req.flash('error', 'Location not found!');
            return res.redirect('/campgrounds/new')
        }
        updatedCampground.geometry = geoData.body.features[0].geometry;
    }

    await updatedCampground.save();
    if (req.body.deleteImages) {
        // deleting images from cloudinary
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        // deleting images from mongo
        await updatedCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${updatedCampground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    for (let image of campground.images) {
        await cloudinary.uploader.destroy(image.filename);
    }
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds');
}