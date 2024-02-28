const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/HeroicHaven";

main()
    .then(() => {
        console.log("Connected to DB.");
    })
    .catch((err) => {
        console.log(err);
    });

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});

    // To add owner for each User.
    initData.data = initData.data.map((obj) => ({...obj, owner : "65d12e028ffafbc6a9b538de"}));

    await Listing.insertMany(initData.data);
    console.log("Data was initialized.");
}

initDB();