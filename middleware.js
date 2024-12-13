const { campgroundSchema, reviewSchema } = require('./joiValidations.js');
const ExpressError = require('./utilities/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review.js');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // console.log(req.path, req.originalUrl);
        //path gives just the path inside the router but originalUrl gives the entire url

        // req.session.returnTo = req.originalUrl;

        //we are removing the above line from here bcoz suppose i went to a url which requires authentication, then return to will be set if i am not logged in ---> and i will be redirected to the login page ---> but suppose if i do npt login and go to some other route "Y", then i want to log in (without triggering this isLoggedIn middleware), after lgging in it will take me to the returnTo url set before and not to the route "Y" where i recently was

        // to tackle that we shift this logic to the app.use in the app.js

        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};


/*
due to some recent security improvements in the Passport.js version updates (used for authentication in our BaseCampX application), the session now gets cleared after a successful login. This causes a problem with our returnTo redirect logic because we store the returnTo route path (i.e., the path where the user should be redirected back after login) in the session (req.session.returnTo), which gets cleared after a successful login.

To resolve this issue, we will use a middleware function to transfer the returnTo value from the session (req.session.returnTo) to the Express.js app res.locals object before the passport.authenticate() function is executed in the /login POST route. Therefore, keep these instructions handy while coding along with the next video.

*/

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have the permissions to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have the permissions to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

//Joi Validation Middlewares
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msgs = error.details.map(e => e.message);
        const msg = msgs.join(", ");
        // console.dir(error)
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msgs = error.details.map(e => e.message);
        const msg = msgs.join(", ");
        // console.dir(error)
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};