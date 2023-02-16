const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {descriptors, places} = require('./seedHelpers'); //order of desc/places doesnt matter because me module.export under these names in file

mongoose.connect('mongodb://localhost:27017/yelpCamp', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.log(err);
    })

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i=0; i< 50; i++){
        const random1000 = (Math.floor(Math.random()*1000));
        const price = Math.floor(Math.random()*100 + 20);
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            image: 'https://images.unsplash.com/photo-1488667499475-42a530fab02b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MXwxfDB8MXxyYW5kb218fHx8fHx8fA&ixlib=rb-1.2.1&q=80&w=1080',
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla suscipit in enim id dapibus. Phasellus pellentesque aliquet nisi, ut efficitur dolor volutpat sed. Sed lacus massa, mollis vel justo eget, ultricies efficitur quam. Vivamus non molestie nulla. Vestibulum eleifend justo vitae rutrum imperdiet. Vivamus ornare molestie purus, vitae bibendum est.",
            price
        })
        await camp.save();
    }
}

seedDB();