const express = require("express");
const app = express();
const compression = require("compression");
const logger = require("morgan");
const path = require("path");
const htmlRoutes = require("./backend/routes/htmlRoutes");
const bodyParser = require("body-parser");
const session = require("express-session");
const fileupload = require("express-fileupload");
const dotenv = require('dotenv');
app.use(logger("dev"));
app.use(compression());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

// app.use(fileupload());

app.set("views",__dirname+"/client/views");

app.use(express.static(path.join(__dirname,"/client/assets")));

app.engine("html",require("ejs").renderFile);

app.set("view engine","ejs");

app.use(session({
    secret: "this_remains_a_secret",
    name: "sid",
    resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge: 1000*60*60*2,
        sameSite: true
    }
}));

app.use("/",htmlRoutes.router);

app.set("port",4000);

app.listen(app.get("port"),() =>{
    console.log("Application running on port ",app.get("port"));
});

module.exports = app;