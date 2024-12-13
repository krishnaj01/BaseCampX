// Import the 'createRequire' function from the 'module' module
// Create a require function

import { createRequire } from "module";
const require = createRequire(import.meta.url);
//

if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

import { createClient } from 'pexels';

const client = createClient(`${process.env.PEXELS_API_KEY}`);
const query = 'camp';

//trial & error code
// client.photos.search({ query, per_page: 1 }).then(response => {
//     // const photo = photos[0];
//     console.log(response.photos[0].src.original);
// });


//MONGOOSE CONNECTION
//Handling Errors during initial connection
const connection = mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
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

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    const pexelImages = await client.photos.search({ query, per_page: 6 }).then(response => response.photos);
    // console.log(pexelImages.length); ---> max 80
    for (let i = 0; i < 500; i++) {
        const random1030 = Math.floor(Math.random()*1030);
        const price = Math.floor(Math.random() * 200) + 1;
        const camp = new Campground({
            author: '674427d12c168d56fc165803', //setting initial author that exists
            location: `${cities[random1030].city}, ${cities[random1030].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: images[i].src.medium,
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. At, atque nulla! Deleniti ipsam ducimus magni quaerat nulla alias reprehenderit deserunt. Necessitatibus ullam, debitis ipsam quasi sequi inventore illo cumque delectus. Dicta officia obcaecati ex, praesentium facilis quam ad, consequuntur aliquam nam quidem eos assumenda illum accusamus nesciunt consectetur eaque sunt asperiores beatae et. Temporibus debitis suscipit libero ducimus, adipisci assumenda!',
            price: `${price}`,
            geometry: {
                type: "Point",
                coordinates: [cities[random1030].longitude, cities[random1030].latitude]
            },
            images: [
                {
                  url: pexelImages[1].src.medium,
                  filename: pexelImages[1].id
                },
                {
                    url: pexelImages[4].src.medium,
                    filename: pexelImages[4].id
                },
                {
                    url: pexelImages[5].src.medium,
                    filename: pexelImages[5].id
                }
            ]
        })
        await camp.save();
        // j=j+2;
    }

}

seedDB().then(async () => {
    console.log("SEED FILE RUNNED SUCCESSFULLY!!!")
    await mongoose.disconnect();
});

//closing mongoose connection after seed data has been created