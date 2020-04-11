//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const app = express();
// const encrypt = require("mongoose-encryption");
// const md5 = require('md5'); //lvl 3 encryption



// {authentication}
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

// const bcrypt = require('bcrypt');
// const saltRounds = 10;



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

// {Set up passport session}
app.use(session({
    secret: 'ourLittleCat',
    resave: false,
    saveUninitialized: false
        // cookie: { secure: true } //This should be commented out if using session-strategy
}));

app.use(passport.initialize());
app.use(passport.session());

//----------main code---------


//+-----------------------------------------------+
//|    DATABASE SET UP
//+-----------------------------------------------+
//-- 1. connect to (create) a database

mongoose.connect("mongodb://localhost:27017/userAuthDB", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});


userSchema.plugin(passportLocalMongoose);
//{Encript the user database}
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema); //<--mongoose model

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//--------------------------------------------------+

//========================{APP.GET pages route}=================================
//{HOME ROUTE}
app.get("/", function(req, res) {
    res.render("home");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});

// app.get("/:routeName", function(req, res) {
//     const requestedRoute = req.params.routeName;
//     const root = req.params.routeName;

//     switch (requestedRoute) {
//         case "login":
//             res.render("login", { warningClass: "invis-hidden" });
//             break;
//         case "register":
//             res.render("register");
//             break;
//         default:
//             break;
//     }
// });

app.get("/secrets", function(req, res) {
    //  {Check if the user already login (authenticated), if yes, render the logined page, if not redirect
    //  to the login page}
    console.log(req.isAuthenticated());
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("login");
    }
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

app.get("/submit", function(req, res) {
    res.render("submit");
});

//========================{APP.POST pages route}=================================
app.post("/register", function(req, res) {
    User.register({ username: req.body.username }, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            })
        }
    });
});

app.post("/login", function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            })
        }
    });
});

// app.post("/secrets", function(req, res) {
//     res.redirect
// })

// -----------------END-----------

app.listen(3000, function() {
    console.log("Server started on port 3000");
});