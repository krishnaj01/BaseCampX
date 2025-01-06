if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utilities/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const User = require('./models/user');
const MongoStore = require('connect-mongo');

const port = process.env.PORT || 8080;

const campgroundRoutes = require('./routes/campgroundRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');

//MONGOOSE CONNECTION
//Handling Errors during initial connection

const dbURL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

mongoose.connect(dbURL)
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!");
    })
    .catch((err) => {
        console.log("MONGO CONNECTION ERROR RECEIVED!!!");
        console.log(err);
    })

//Handling Errors after initial connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); // telling express to serve our public directory
// app.use(express.static('public'));
app.use(mongoSanitize({
      replaceWith: '_',
}));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60, //time in seconds
    crypto: {
        secret
    }
});

//the use of touchAfter
// If you are using express-session >= 1.10.0 and don't want to resave all the session on database every single time that the user refreshes the page, you can lazy update the session, by limiting a period of time.

// by doing this, setting touchAfter: 24 * 3600 you are saying to the session be updated only one time in a period of 24 hours, does not matter how many request's are made (with the exception of those that change something on the session data)

// By default, connect-mongo uses MongoDB's TTL collection feature (2.2+) to have mongodb automatically remove expired sessions.

store.on("error", function(e){
    console.log('SESSION STORE ERROR', e);
});

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false, //to remove deprecation warnings
    saveUninitialized: true, //to remove deprecation warnings
    cookie: {
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production', //the cookie should only be accessible or work over HTTPS ---> localhost is not HTTPS, therfore it is not secure--> if it set true, then the cookies can only be configured over HTTPS
        // the above was not working --> do not know the reason yet
        expires: Date.now() + (1000*60*60*24*7), //Date.now() is in milliseconds
        maxAge: 1000*60*60*24*7
    }
};

app.use(session(sessionConfig));
app.use(flash());

app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.pexels.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
// Middleware
//session should be used before passport.session() is used
// To use Passport in an Express or Connect-based application, configure it with the required passport.initialize() middleware. If your application uses persistent login sessions (recommended, but not required), passport.session() middleware must also be used.

//the below static methods are located on the user model when we use the passport-local-mongoose plugin
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // tells passport how to store a user in the session
passport.deserializeUser(User.deserializeUser()); // tells passport how to get the user out of a session



app.use((req,res,next) => {
    //we have access to the below on every single template
    // In Express.js, res.locals is an object that provides a way to pass data through the application during the request-response cycle. It allows you to store variables that can be accessed by your templates and other middleware functions.

    // debugging statements
    // console.log(req.session);
    // console.log(res.locals.returnTo);

    // making amends to the error as specified isLoggedIn middleware

    if(!['/register', '/login', '/'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl;
    }

    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

app.all("*", (req,res,next) => {
    next(new ExpressError(404, 'Page Not Found'));
});

//setting up our custom error handler
app.use((err,req,res,next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Something went wrong!';
    res.status(statusCode).render('error', {err});
});

app.listen(port, () => {
    console.log(`Serving at Port ${port}`);
});