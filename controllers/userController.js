const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        //the below code helps directly login just after registering so that the user doesn't have to login separately after registering
        // it uses callback function
        req.login(registeredUser, err =>  {
            if (err) return next(err);
            req.flash('success', 'Welcome to BaseCampX!');
            res.redirect('/campgrounds');
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/register');
    }
}

/*
When the login operation completes, user will be assigned to req.user.

Note: passport.authenticate() middleware invokes req.login() automatically. This function is primarily used when users sign up, during which req.login() can be invoked to automatically log in the newly registered user.
*/

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
}

//Remember that middleware functions are executed in the order they are specified in the route. So, in this case, storeReturnTo should be called first, followed by passport.authenticate() and then the final middleware function to redirect the user.

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back!');
    // const redirectUrl = req.session.returnTo || '/campgrounds';
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}
/*
 |
 |
 v
Namely, when you implement the req.logout() logic in the /logout route (in routes/users.js) in the upcoming video lecture, you might see this error when you test out the logout functionality: req#logout requires a callback function

This happens because in the latest versions of Passport.js, the req.logout() method now requires a callback function passed as an argument. Inside this callback function, we will handle any potential errors and also execute the code to set a flash message and redirect the user.
*/