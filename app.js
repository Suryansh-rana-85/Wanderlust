const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); 
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
// flash
const flash = require("connect-flash");
// passport
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// require routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// connect mongoose
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

// middlewares
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

// root route
app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

// middlewares
app.use(session(sessionOptions));
app.use(flash());

// passport
app.use(passport.initialize());
app.use(passport.session());
// static authenticate method in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// passport - serialize and deserialize of model
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware-flash 
app.use((req, res, next) => {
    // success
    res.locals.success = req.flash("success");
    // error 
    res.locals.error = req.flash("error");  
    // current user
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

// routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter)
app.use("/", userRouter);

// 404
app.all("/:any", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// custom error handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err });
});

// server starts
app.listen(8080, () => {
    console.log("server is listening to port: 8080");
});