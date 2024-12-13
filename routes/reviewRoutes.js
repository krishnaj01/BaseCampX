const express = require('express');

// Cannot read properties of null (reading 'reviews') --> to tackle this error --> we need to write the router as below
// this is because the router can't access the id as specified in the prefix route in the app.js file --> to make that id accessible we use the below syntax

const router = express.Router({ mergeParams: true });
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')
const reviewController = require('../controllers/reviewController');
const catchAsync = require('../utilities/catchAsync');

//new review
router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.createReview));

//delete review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview));

module.exports = router;