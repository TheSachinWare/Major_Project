const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signup = async(req, res) => {
    try{
    let { username, email, password } = req.body;
    const newUser = new User ({ email, username });

    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);

    req.login(registeredUser, (err) => {
        if(err){
            return next(err);
        }
        
        req.flash("success", "Welcome to HeroicHaven...!");
        res.redirect("/listings");
    });
    } catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }//If we didn't put try & catch block here & used wrapAsync then, we jump to random page showing us error.
}

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.login = async(req, res) => {
    req.flash("success", "Welcome back to HeroicHaven !");

    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logOut((err) => {
        if(err){
            return next(err);
        }
        req.flash("success", "You are logged out.");
        res.redirect("/listings");
    })
}