const express = require('express');
const router = express.Router();

const catchAsync = require('../utilities/catchAsync');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware.js');
const campgroundController = require('../controllers/campgroundController.js');

const { storage } = require('../cloudinary'); //no need to specify index.js --> bcoz node automatically looks for index file

const multer  = require('multer');
const upload = multer({ storage });

//all camps
router.get('/', catchAsync(campgroundController.index));

//new camp
router.get('/new', isLoggedIn, campgroundController.renderNewForm);
router.post('/', isLoggedIn , upload.array('image'), validateCampground, catchAsync(campgroundController.createCampground));

//show individual camps
router.get('/:id', catchAsync(campgroundController.showCampground));

//edit camp
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgroundController.renderEditForm));
router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgroundController.updateCampground));

//delete camp
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgroundController.deleteCampground));

module.exports = router;