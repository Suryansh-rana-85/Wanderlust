// Development Phase
if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); 
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");

// passport
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Models
const User = require("./models/user.js");

// require routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// // Connect mongoose
const dbUrl = process.env.ATLASDB_URL;
main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });
async function main() {
    await mongoose.connect(dbUrl);
}

// views and public 
app.set("view engine", "ejs"); 
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public"))); 

// Built-in middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// ejs-mate 
app.engine('ejs', ejsMate); 

// Session Store
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

// Session options
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,  // mili-seconds
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, 
    }
};

// Middlewares
app.use(session(sessionOptions));
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// Passport
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware-flash 
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Use Routers
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter)
app.use("/", userRouter);

// 404 error
app.all('*', (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// Custom error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err });
});

// Server starts
app.listen(8080, () => {
    console.log("server is listening to port: 8080");
});