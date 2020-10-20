const dbconn = require("../databases/mongodb");
const Users = dbconn.Users;
const Doctor_details = dbconn.Doctor_details;

var sessioncheck = (req,res,next) =>{
    if(req.session.user){
        console.log("already logged in");
        res.redirect("/");
    }
    else{
        next();
    }
}


var sessionnotactive = (req,res,next) =>{
    if(!req.session.user){
        console.log("Not logged in yet");
        req.session.message = "Login First";
        res.redirect("/email_login");
    }
    else{
        next();
    }
}

var is_user_only = (req,res,next) => {
    if(req.session.user.is_doctor==true){
        console.log("This page is for users only");
        res.redirect("/");
    }
    else{
        next();
    }
}

var alreadyregistered_email = (req,res,next) => {
    var emailid = req.body.email;
    console.log("email id received for registeration is",emailid);
    Users.find().where({email:emailid}).exec().then(userreceived => {
        if(userreceived.length!= 0){
            console.log("Email already in use with user details as ",userreceived);
            req.session.message = "Email already in use"
            res.redirect("/signup");
        }
        else{
            next();
        }
    }).catch(err => {
        console.log("couldn't look into database because",err); 
    });
}

var alreadyregistered_number = (req,res,next) => {
    var number = req.body.number;
    console.log("number received for registeration is",number);
    Users.find().where({number:number}).exec().then(userreceived => {
        if(userreceived.length!= 0){
            console.log("A User is already registered with given number",userreceived);
            req.session.message = "Number already in use";
            res.redirect("/signup");
        }
        else{
            next();
        }
    }).catch(err => {
        console.log("couldn't look into database because",err); 
    });
}

var otp_sent = (req,res,next) =>{
    if(!req.session.f_otpid){
        console.log("User hasn't been sent an OTP successfully for submitting OTP");
        res.redirect("/");
    }
    else{
        next();
    }
}

var doctor_details_added = (req,res,next) => {
   var is_doctor =  req.session.user.is_doctor;
   var objectid = req.session.user._id;
   if(is_doctor==true){
       Doctor_details.find().where({_id:objectid}).exec().then(userreceived => {
           if(userreceived.length == 1){
               console.log("Doctor details available in db",userreceived);
               next();
           }
           else{
               res.redirect("/doctor_details_form");
           }
       })
   }
   else{
       next();
   }
}

var is_doctor = (req,res,next) => {
    if(req.session.user.is_doctor == true){
        next();
    }
    else{
        res.redirect("/");
    }
}

var booking_made = (req,res,next) =>{
    //This middleware and the one below it are being put in place so as to retain the details of the schedule and slot if in case the user decides to reschedule or cancel the slot booking he/she just made
    if(req.session.booking_made==true){
        req.session.booking_made = false;
        next();
    }
    else if(!req.session.booking_made){
        res.redirect("/");
    }
    else{
        res.redirect("/");
    }
}

var check_booking_made = (req,res,next) =>{
    console.log("req.session.booking_made has value:",req.session.booking_made);
    if(req.session.booking_made == true){
        console.log("redirecting because booking_made is true");
        res.redirect("/");
    }
    else if(req.session.booking_made==false){
        console.log("not redirecting");
        next();
    }
    else if(!req.session.booking_made){
        console.log("redirecting because booking_made does not exist");
        res.redirect("/");
    }
}

var dynamic_filters_doctor = (req,res,next) =>{
    var location_filters = [];
    var treatment_filters = [];
    var hospital_filters = [];
    Users.find({is_doctor:true}).exec().then(users =>{
        for(var i = 0 ; i < users.length ; i++){
            if(!location_filters.includes(users[i].city)){
                location_filters.push(users[i].city);
            }
        }
        Doctor_details.find({}).exec().then(details =>{
            for(var j = 0 ; j < details.length ; j++){
                if(details[j].treatments){
                    for(var k = 0 ; k < details[j].treatments.length; k++){
                        if(!treatment_filters.includes(details[j].treatments[k].value)){
                            treatment_filters.push(details[j].treatments[k].value);
                        }
                    }
                }
                for( var l = 0 ; l < details[j].hospitals.length ; l++){
                    console.log("value",details[j].hospitals[l].value);
                    if(!hospital_filters.includes(details[j].hospitals[l].value)){
                        hospital_filters.push(details[j].hospitals[l].value);
                    }
                }
            }
            req.session.filters ={
                location_filters:location_filters,
                hospital_filters:hospital_filters,
                treatment_filters:treatment_filters
            };
            console.log("req.session.filters:",req.session.filters);
            next();
        }).catch(err =>{
            console.log(err);
        });
    }).catch(err =>{
        console.log(err);
    });
}

var verify_admin = (req,res,next) =>{
    if(req.session.user.is_admin == true){
        next();
    }
    else{
        res.redirect("/");
    }
}

module.exports = {
    alreadyregistered_number:alreadyregistered_number,
    alreadyregistered_email:alreadyregistered_email,
    sessioncheck:sessioncheck,
    otp_sent: otp_sent,
    sessionnotactive:sessionnotactive,
    doctor_details_added:doctor_details_added,
    is_doctor:is_doctor,
    is_user_only:is_user_only,
    booking_made:booking_made,
    check_booking_made:check_booking_made,
    dynamic_filters_doctor:dynamic_filters_doctor,
    verify_admin:verify_admin
}