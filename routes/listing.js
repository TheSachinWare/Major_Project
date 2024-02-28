const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js")
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const { route } = require("./user.js");

const multer = require("multer");
// const upload = multer({ dest : 'uploads/'});
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
    .route("/")
    .get( wrapAsync(listingController.index))//Index Route.
    .post( isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));// Create Route.

    // .post(upload.single('listing[image]'), (req, res) => {
    //     // res.send(req.body);// Gives empty data because data is not understood by our backend because parsing is only done in urlencoded form, so we use multer library.
    //     res.send(req.file);
    // })

//New Route :-
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
    .route("/:id")
    .get( wrapAsync(listingController.showListing))//Show Route.
    .put( isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))//Update Route.
    .delete( isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));//Delete Route.

//Edit Route.
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// app.get("/testListing", async (req, res) =>{
//     let sampleListing = new Listing({
//         title : "My New Villa",
//         description : "By the beach",
//         price : 1200,
//         location : "Calangute, Goa",
//         country : "India"
//     });

//     await sampleListing.save();
//     console.log("Sample was saved.");
//     res.send("Successful Testing.");
// });

module.exports = router;