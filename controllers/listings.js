const { response } = require("express");
const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken : mapToken });

module.exports.index = async (req, res) =>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm = (req, res) =>{
    // console.log(req.user);
   
    res.render("listings/new.ejs");//It i ssearching 'new' as a id.So, we are placing it above show route.
}

module.exports.showListing = async (req, res) =>{
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path : "reviews", 
        populate : { 
            path : "author"
        } 
    })
    .populate("owner");

    if(!listing){
        req.flash("error", "Listing you requested for, doesn't exist...!");
        res.redirect("/listings");
    }

    console.log(listing);
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing = async (req, res, next) => {
    let responce = await geocodingClient.forwardGeocode ({
        query : req.body.listing.location,
        limit : 2
    })
    .send()

    // console.log(responce.body.features[0].geometry);
    // res.send("Done !");

    // let { title, description, image, price, country, location } = req.body;
    // let listing = req.body.listing;

    // console.log(listing);

    //Using try-catch block.
    // try {
    //     const newListing = new Listing(req.body.listing);
    //     await newListing.save();

    //     res.redirect("/listings");
    // } catch (err) {
    //     next(err);
    // }

    //Using wrapAsync function.

    //To make 'error from client' clear to client. 
    // if(!req.body.listing) {
    //     throw new ExpressError(400, "Send valid data for listings.");
    // }
    
    let url = req.file.path;
    let filename = req.file.filename;
    // console.log(url, " . . ", filename);
    
    const newListing = new Listing(req.body.listing);
    // Method - I for making each field required.
    // if(!newListing.title) {
    //     throw new ExpressError(400, "Title is missing.");
    // }
    // if(!newListing.description) {
    //     throw new ExpressError(400, "Description is missing.");
    // }
    // if(!newListing.location) {
    //     throw new ExpressError(400, "Location is missing.");
    // }

    //Method - II by using Joi.dev for making each field required.
    // let result = listingSchema.validate(req.body);
    // console.log(result);

    // if(result.error){
    //     throw new ExpressError(400, result.error);
    // }

    // Method - III by using function using Joi.dev tools as middleware for making each field required.

    console.log(req.user);

    newListing.owner = req.user._id;// To store new listings after logging in.
    newListing.image = { url, filename};
    newListing.geometry = responce.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);

    req.flash("success", "New Listing Created !");

    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) =>{
    let { id } = req.params;
    const listing = await Listing.findById( id );
    if(!listing){
        req.flash("error", "Listing you requested for, doesn't exist.");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/edit.ejs", { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res) =>{
    // if(!req.body.listing) {
    //     throw new ExpressError(400, "Send valid data for listing.");
    // }
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});//Deconstructing here listing i.e. converting into simgular parts.

    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated !");
    res.redirect(`/listings/${id}`);
}


module.exports.destroyListing = async (req, res) =>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);

    console.log(deletedListing);

    req.flash("success", "Listing Deleted.");
    res.redirect("/listings");
}