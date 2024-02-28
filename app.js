if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
console.log(process.env.SECRET);

const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
// const MONGO_URL = "mongodb://127.0.0.1:27017/HeroicHaven";
const dbUrl = process.env.ATLASDB_URL;
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded( {extended : true } ));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public"))); //To use static files in 'public' folder.

app.engine("ejs", ejsMate);

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto : {
        secret : process.env.SECRET,
    },
    touchAfter : 24 * 3600
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE.", err);
});

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 *  60 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true // To prevent from cross scripting attacks.
    }
};

app.use(session(sessionOptions));
app.use(flash());// we have to use this flash before '/listings' routes because we are using flash with the help of routes.

app.use(passport.initialize());
app.use(passport.session());// To identify that same user is sending request & getting responces.
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());// Serialize - when login.
passport.deserializeUser(User.deserializeUser());// Deserialize - when logout.

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    // console.log(res.locals.success);
    next();
});

main()
    .then(() =>{
    console.log("Connected to DB.");
    })
    .catch((err) =>{
        console.log(err);
    })

async function main(){
    await mongoose.connect(dbUrl);
}

// app.get("/", (req, res) =>{
//     res.send("Hi, I am Root.");
// });

// For adding new Demo User.
// app.get("/demoUser", async(req, res) => {
//     let fakeUser = new User({
//         email : "student1@gmail.com",
//         username : "deltaStudent1"
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld1");
//     res.send(registeredUser);
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found."));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong." } = err;

    // res.send("Something went wrong...!!!");
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { err });
});

app.listen(port, () =>{
    console.log(`Server is listening to port :- ${port}`);
});