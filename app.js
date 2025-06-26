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

// Connect mongoose
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

// Session options
const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,  // mili-seconds
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, 
    }
};

// Root route
app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

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

// demo user, hashing algo = pdkdf2
// app.get("/demouser", async(req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "deltastudent"
//     });
//     // save user in database
//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter)
app.use("/", userRouter);

// 404 error
app.all("/:any", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// Custom error handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err });
});

// Server starts
app.listen(8080, () => {
    console.log("server is listening to port: 8080");
});