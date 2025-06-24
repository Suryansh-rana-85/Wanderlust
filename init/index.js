const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
};

// insert data
const initDB = async () => {
    await Listing.deleteMany({});   // delete if stored previously
    initData.data = initData.data.map((obj) => ({...obj, owner: "6858e39452b608c1042c6be1"})); // for adding owner
    await Listing.insertMany(initData.data);  // new data
    console.log("data was initialized");
};

initDB();