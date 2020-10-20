const express = require("express");
const e = require("express");
const app = express();
const dbconn = require("../databases/mongodb");
const Doctor_details = dbconn.Doctor_details;
const Users = dbconn.Users;
const Schedules = dbconn.Schedules;
const Appointments = dbconn.Appointments;

var admin_panel_home = (req,res) =>{
    if(req.session.message && req.session.message!= ""){
        var message = req.session.message;
    }
    else{
        var message = "";
    }
    if(req.session.user){
        var loggedinstatus = true;
    }
    else{
        var loggedinstatus = false;
    }
    res.render("admin_panel_home",{
        message,
        loggedinstatus,
        user:req.session.user
    });
}

module.exports = {
    admin_panel_home:admin_panel_home
}