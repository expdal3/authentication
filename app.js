//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");
const app = express();
const md5 = require('md5'); //lvl 3 encrypt


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

//----------main code---------


//+-----------------------------------------------+
//|    DATABASE SET UP
//+-----------------------------------------------+
//-- 1. connect to (create) a database

mongoose.connect("mongodb://localhost:27017/userAuthDB", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    secret: String
});
//{Encript the user database}
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema); //<--mongoose model
//--------------------------------------------------+

//========================{APP.GET pages route}=================================
//{HOME ROUTE}
app.get("/", function(req, res) {
    res.render("home");
});

app.get("/:routeName", function(req, res) {
    const requestedRoute = req.params.routeName;
    const root = req.params.routeName;

    switch (requestedRoute) {
        case "login":
            res.render("login", { warningClass: "invis-hidden" });
            break;
        case "register":
            res.render("register");
            break;
        default:
            break;
    }
});

//========================{APP.POST pages route}=================================
app.post("/register", function(req, res) {
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    });
    newUser.save(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.render("secrets");
        }
    });
});

app.post("/login", function(req, res) {
    const inputUserEmail = req.body.username;
    const inputPassword = req.body.password;
    User.findOne({ email: inputUserEmail }, function(err, foundUserEmail) {
        if (err) {
            console.log(err);
        } else {
            if (foundUserEmail) {
                if (foundUserEmail.password == inputPassword) {
                    res.render("secrets", { user: foundUserEmail });
                    // app.get("/secrets/:routeName", function(req, res){

                    // }
                } else {
                    res.render("login", { warningClass: "invis-show warning" });

                }
            }
        }
    });
});

// -----------------END-----------

app.listen(3000, function() {
    console.log("Server started on port 3000");
});