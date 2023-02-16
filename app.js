const mongoose = require('mongoose');
const path = require('path'); //this is so we can concact our views path with current directory
const express = require('express');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Campground = require('./models/campground'); // dont need .js on this path?
const ExpressError = require('./utilities/ExpressError');
const catchAsync = require('./utilities/catchAsync')
const {campgroundSchema} = require('./schemas')

mongoose.connect('mongodb://localhost:27017/yelpCamp', { 
    useNewUrlParser: true, 
    useCreateIndex: true,
    useUnifiedTopology: true
})


//CONNECTING MONGO DB
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//app.use will work any time any request at all is made!!!!!
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// post request information validation middleware
// this middleware checks the post request info and validates it against our joi model
// if anything doesnt match we throw new ExpressError with msg and 400 status
 const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
        //we use throw here to pass our code along to generic error handler with our new ExpressError
    }
    else{
        next();
    }
 }

app.get('/', (req,res) => {
    res.render('home');
});

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', validateCampground, catchAsync(async (req,res, next) => {
        if(!req.body.campground) throw new ExpressError('Invlaid Campgrounds Data', 400)
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id', catchAsync(async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render(`campgrounds/show`, {campground, id});
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', {campground});
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) =>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {new:true});
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async (req,res)=>{
    const {id} = req.params; 
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

//this allow our app to catch all other uncaught routes
//we will then create new ExpressError and return page not found and 404
app.all('*', (req, res, next) => {
    next(new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
    const {status = 500} = err;
    if (!err.message) err.message = "Oh no";
    res.status(status).render('error', {err});
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
})