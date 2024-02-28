const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    description : String,
    image : {
        // type : String,
        // default : "https://unsplash.com/photos/selective-focus-photo-of-woman-facing-buildings-IRB-b22bPe8",
        // set : (v) => v === "" ? "https://unsplash.com/photos/selective-focus-photo-of-woman-facing-buildings-IRB-b22bPe8" : v,

        url : String,
        filename : String
    },
    price : Number,
    location : String,
    country : String,
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review",
        }
    ],
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    // coordinates : {
    //     type : [Number],
    //     required : true
    // }
    geometry : {
        type : {
            type : String,
            enum : ["Point"],
            required : true
        },
        coordinates : {
            type : [Number],
            required : true
        }
    },
    //To add filter in the backend.
    // category : {
    //     type : String,
    //     enum : ["mountains", "arctic", "farms", "deserts"]
    // }
});

listingSchema.post("findOneAndDelete", async(listing) => {
    if(listing){
        await Review.deleteMany({ _id : { $in : listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;