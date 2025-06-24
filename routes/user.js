const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

// signup form
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs")
});

// post signup
router.post("/signup", 
    wrapAsync(async(req, res) => {
        try {
            let { username, email, password } = req.body;
            const newUser = new User({ email, username });
            const registeredUser = await User.register( newUser, password );
            console.log(registeredUser);
            // direct login after signup
            req.login(registeredUser, (err) =>{
                if(err) {
                    return next(err);
                }
                req.flash("success", "Welcome to Wanderlust!");
                res.redirect("/listings");
            });
        }
        catch(err) {
            req.flash("error", err.message);
            res.redirect("/signup");
        }
    })
);

// login form
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// post login
router.post(
    "/login", 
    saveRedirectUrl, // url saved in locals
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }), 
    async(req, res) => {
        let { username } = req.user;
        req.flash("success", "Welcome back to Wanderlust!");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    }
);

// logout
router.get("/logout",
    (req, res, next) => {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "You are logged out!");
            res.redirect("/listings");
        });
    });

module.exports = router;