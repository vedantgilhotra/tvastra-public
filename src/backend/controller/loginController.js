const dbconn = require("../databases/mongodb");
const Users = dbconn.Users;
const Doctor_details = dbconn.Doctor_details;
const Schedules = dbconn.Schedules;
const Appointments = dbconn.Appointments;
const Nexmo = require('nexmo')
const s3 = require("../services/profile_picture_upload");
const e = require("express");
const upload = s3.upload;
var new_profile_picture_upload = upload.single("profile_picture_input");
var profile_picture_upload = upload.single("profile_picture");
var medical_records_upload = upload.array("pictures_input",12);

function value_extractor(string) {
    console.log("String:", string);
    var result = JSON.parse(string);
    console.log("executed");
    return result;
};

const nexmo = new Nexmo({
    apiKey: '128edfd3',
    apiSecret: 'GW4Yx54J8fx1mkMs'
});
var signup = (req, res) => {
    console.log("The request body is ", req.body);
    if (!req.body.is_doctor) {
        req.body.is_doctor = false;
        console.log("is doctor for user is ", req.body.is_doctor);
        const user = new Users(req.body);
        user.save().then(addeduser => {
            console.log("New User has been saved with details as: ", addeduser);
            if (addeduser != null) {
                req.session.user = addeduser;
                req.session.message = "Login Successful";
                console.log("User has been logged in too");
            }
            res.redirect("/");
        }).catch(err => {
            console.log(err);
            res.redirect("/");
        });
    }
    else if (req.body.is_doctor == "on") {
        req.body.is_doctor = true;
        console.log("is doctor for doctor is ", req.body.is_doctor);
        const user = new Users(req.body);
        user.save().then(addeduser => {
            console.log("New Doctor Added to database with details as: ", addeduser);
            if (addeduser != null) {
                req.session.user = addeduser;
                req.session.message = "Login Successful";
                console.log("User has been logged in too");
            }
            res.redirect("/");
        }).catch(err => {
            console.log(err);
            res.redirect("/");
        });
    }
};

var email_login = (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    
    Users.find().where({ email: email, password: password }).exec().then(userreceived => {
        if (userreceived.length == 1) {
            req.session.user = userreceived[0];
            console.log("User logged in with user details as ", req.session.user);
            req.session.message = "Login Successful";
            if(userreceived[0].is_admin == true){
                console.log("user_type is admin");
                res.redirect("/admin_panel_home");
            }
            else{
                console.log("user_type is user");
                res.redirect("/");
            }
            
        }
        else {
            req.session.message = "Incorrect email or password";
            res.redirect("/email_login");
        }
    }).catch(err => {
        console.log("Couldn't look for user with error", err);
    });
}

var forgot_password_email = (req, res) => {
    var email = req.body.email;
    console.log("email received to check is", email);
    Users.find().where({ email: email }).exec().then(userreceived => {
        if (userreceived.length == 1) {
            var usernumber = userreceived[0].number;
            var numberString = '91' + usernumber.toString();
            console.log("number being given is ", numberString);
            req.session.temp_user = userreceived[0];
            nexmo.verify.request({
                number: numberString,
                brand: "Tvastra",
                code_length: '4',
                workflow_id: 2
            }, (err, result) => {
                if (err) {
                    console.error(err);
                    req.session.message = "OTP could not be sent";
                    res.redirect("/forgot_password_email");
                } else {
                    const verifyRequestId = result.request_id;
                    console.log('request_id i.e otp is sent', verifyRequestId);
                    req.session.f_otpid = verifyRequestId;
                    res.redirect("/forgot_password_otp");
                }
            });
        }
        else {
            req.session.message = "Email not registered";
            res.redirect("/forgot_password_email");
        }
    })
}

var forgot_password_otp = (req, res) => {
    var otp = req.body.otp;
    var request_id = req.session.f_otpid;
    nexmo.verify.check({
        request_id: request_id,
        code: otp,
    }, (err, result) => {
        if (err) {
            console.log(error);
        }
        else {
            console.log("result is", result);
            if (result.status == "16") {
                req.session.message = "Incorrect OTP";
                console.log(err);
                res.redirect("/forgot_password_otp");
            }
            else if (result.status == "0") {
                console.log("correct otp received", result);
                req.session.otp_verified = true;
                req.session.message = "OTP verified";
                delete req.session.f_otpid;
                res.redirect("/update_password");
            }
            else if (result.status == "17") {
                console.log("too many attempts");
                req.session.message = "Too many failed attempts";
                delete req.session.temp_user;
                delete req.session.f_otpid;
                res.redirect("/");
            }
        }
    });
}

var resend_otp = (req, res) => {
    nexmo.verify.control({
        request_id: req.session.f_otpid,
        cmd: 'trigger_next_event'
    }, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            console.log(result);
            if (result.status == "0") {
                req.session.message = "OTP resent";
                res.redirect("/forgot_password_otp");
            }
            else {
                req.session.message = "unknown error occured";
                res.redirect("/forget_password_otp");
            }
        }
    });
}

var resend_otp_login = (req, res) => {
    nexmo.verify.control({
        request_id: req.session.f_otpid,
        cmd: 'trigger_next_event'
    }, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            console.log(result);
            if (result.status == "0") {
                req.session.message = "OTP resent";
                res.redirect("/otp_login_otp");
            }
            else {
                req.session.message = "unknown error occured";
                res.redirect("/otp_login_otp");
            }
        }
    });
}


var update_password = (req, res) => {
    if (req.session.temp_user) {
        var newpassword = req.body.new_password;
        var confirmpassword = req.body.confirm_password;
        if (newpassword == confirmpassword) {
            //update password of temp_user
            //deleting the otp_verified session variable here
            Users.findByIdAndUpdate(req.session.temp_user._id, { password: newpassword }, (err, result) => {
                if (err) {
                    console.log("error occured updating the password ", err);
                }
                else {
                    console.log(result);
                    console.log("password updated successfully");
                    delete req.session.temp_user;
                    delete req.session.otp_verified;
                    req.session.message = "Password updated successfully";
                    res.redirect("/email_login");
                }
            })
        }
        else {
            //create error message for user stating the passwords do not match
            req.session.message = "Passwords do not match";
            //redirecting user back to same page
            res.redirect("/update_password");
        }
    }
    else {
        console.log("Invalid post request");
    }
}

var otp_login_number = (req, res) => {
    var number = req.body.number;
    console.log("number received to check is", number);

    Users.find({number: number}).exec().then(userreceived => {
        console.log("Users query returned",userreceived);
        if (userreceived.length == 1) {
            console.log("user exists");
            var usernumber = userreceived[0].number;
            var numberString = '91' + usernumber.toString();
            console.log("number being given is ", numberString);
            req.session.temp_user = userreceived[0];
            nexmo.verify.request({
                number: numberString,
                brand: "Tvastra",
                code_length: '4',
                workflow_id: 2
            }, (err, result) => {
                if (err) {
                    console.error(err);
                    req.session.message = "OTP could not be sent";
                    res.redirect("/otp_login_number");
                } else {
                    const verifyRequestId = result.request_id;
                    console.log('request_id i.e otp is sent', verifyRequestId);
                    req.session.f_otpid = verifyRequestId;
                    res.redirect("/otp_login_otp");
                }
            });
        }
        else {
            req.session.message = "Number not registered";
            res.redirect("/otp_login_number");
        }
    })
}

var otp_login_otp = (req, res) => {
    var otp = req.body.otp;
    var request_id = req.session.f_otpid;
    nexmo.verify.check({
        request_id: request_id,
        code: otp,
    }, (err, result) => {
        if (err) {
            console.log(error);
        }
        else {
            console.log("result is", result);
            if (result.status == "16") {
                req.session.message = "Incorrect OTP";
                console.log(err);
                res.redirect("/otp_login_otp");
            }
            else if (result.status == "0") {
                console.log("correct otp received", result);
                req.session.user = req.session.temp_user;
                delete req.session.temp_user;
                req.session.message = "Login Successful";
                delete req.session.f_otpid;
                res.redirect("/");
            }
            else if (result.status == "17") {
                console.log("too many attempts");
                req.session.message = "Too many failed attempts";
                delete req.session.temp_user;
                delete req.session.f_otpid;
                res.redirect("/");
            }
        }
    });
}

var doctor_details_form = (req, res) => {
    console.log("req.body here is", req.body);
    var imageurl = "";
    profile_picture_upload(req, res, err => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Image uploaded successfully");
            imageurl = req.file.location;
            console.log("req.body after image upload is", req.body);
            req.body._id = req.session.user._id;
            req.body.profile_picture = imageurl;
            req.body.hospitals = value_extractor(req.body.hospitals);
            req.body.achievements = value_extractor(req.body.achievements);
            req.body.qualifications = value_extractor(req.body.qualifications);
            req.body.awards = value_extractor(req.body.awards);
            req.body.specializations = value_extractor(req.body.specializations);
            req.body.fee = parseInt(req.body.fee);
            req.body.experience = parseInt(req.body.experience);
            req.body.description = req.body.description;
            const doctor_details = new Doctor_details(req.body);
            doctor_details.save().then(addeddetails => {
                console.log("New details been saved with details as: ", addeddetails);
                res.redirect("/");
            }).catch(err => {
                console.log(err);
                res.redirect("/doctor_details_form");
            });
        }
    });
}

var user_profile_edit = async (req, res) => {
    console.log("req.body is", req.body);
    var imageurl = "https://cdn2.iconfinder.com/data/icons/medical-services-2/256/Doctor2-512.png";

    if (req.body.name) {
        console.log("image not present");
        await Users.findOne().where({ email: req.body.email }).exec().then(result => {
            if (result != null && req.session.user.email != result.email) {
                req.session.message = "Email already in use";
                console.log("email already in use");
                return res.redirect("/user_profile_edit");
            }
        });
        await Users.findOne().where({ number: req.body.number }).exec().then(result => {
            if (result != null && req.session.user.email != result.email) {
                req.session.message = "Number already in use";
                console.log("number already in use");
                return res.redirect("/user_profile_edit");
            }
        });
        await Users.findOne().where({ _id: req.session.user._id }).exec().then(user => {
            console.log("user found");
            if (!user.profile_picture) {
                user.profile_picture = imageurl;
            }
            user.name = req.body.name;
            user.email = req.body.email;
            user.number = parseInt(req.body.number);
            user.gender = req.body.gender;
            user.date = req.body.date;
            user.timezone = req.body.timezone;
            user.house_number = req.body.house_number;
            user.colony = req.body.colony;
            user.city = req.body.city;
            user.state = req.body.state;
            user.country = req.body.country;
            console.log("user before save is", user);
            user.save().then(user => {
                Users.findOne().where({ _id: req.session.user._id }).exec().then(user_updated => {
                    console.log("updated user is", user_updated);
                    req.session.user = user_updated;
                    res.redirect("/user_profile_edit");
                });
            }).catch(err => {
                console.log("issue updating user", err);
            });
        });
    }
    else {
        console.log("image present");
        new_profile_picture_upload(req, res, async err => {
            if (err) {
                console.log("error uploading", err);
            }
            else {
                await Users.findOne().where({ email: req.body.email }).exec().then(result => {
                    if (result != null && req.session.user.email != result.email) {
                        req.session.message = "Email already in use";
                        console.log("email already in use");
                        return res.redirect("/user_profile_edit");
                    }
                });
                await Users.findOne().where({ number: req.body.number }).exec().then(result => {
                    if (result != null && req.session.user.email != result.email) {
                        req.session.message = "Number already in use";
                        console.log("number already in use");
                        return res.redirect("/user_profile_edit");
                    }
                });
                console.log("req.file.location", req.file.location.toString());
                imageurl = req.file.location.toString();
                console.log("req.body after image upload is ", req.body);
                Users.findOne().where({ _id: req.session.user._id }).exec().then(user => {
                    console.log("user found");
                    user.profile_picture = imageurl;
                    user.name = req.body.name;
                    user.email = req.body.email;
                    user.number = parseInt(req.body.number);
                    user.gender = req.body.gender;
                    user.date = req.body.date;
                    user.timezone = req.body.timezone;
                    user.house_number = req.body.house_number;
                    user.colony = req.body.colony;
                    user.city = req.body.city;
                    user.state = req.body.state;
                    user.country = req.body.country;
                    console.log("user before save is", user);
                    user.save().then(user => {
                        Users.findOne().where({ _id: req.session.user._id }).exec().then(user_updated => {
                            console.log("updated user is", user_updated);
                            req.session.user = user_updated;
                            res.redirect("/user_profile_edit");
                        });
                    }).catch(err => {
                        console.log("issue updating user", err);
                    });
                });
            }
        });
    }
}

var doctor_profile_edit = async (req, res) => {
    console.log("req.body is", req.body);
    var imageurl = "https://cdn2.iconfinder.com/data/icons/medical-services-2/256/Doctor2-512.png";

    if (req.body.name) {
        console.log("image not present");
        await Users.findOne().where({ email: req.body.email }).exec().then(result => {
            if (result != null && req.session.user.email != result.email) {
                req.session.message = "Email already in use";
                console.log("email already in use");
                return res.redirect("/doctor_profile_edit");
            }
        });
        await Users.findOne().where({ number: req.body.number }).exec().then(result => {
            if (result != null && req.session.user.email != result.email) {
                req.session.message = "Number already in use";
                console.log("number already in use");
                return res.redirect("/doctor_profile_edit");
            }
        });
        await Users.findOne().where({ _id: req.session.user._id }).exec().then(user => {
            console.log("user found");
            user.name = req.body.name;
            user.email = req.body.email;
            user.number = parseInt(req.body.number);
            user.gender = req.body.gender;
            user.date = req.body.date;
            user.timezone = req.body.timezone;
            user.house_number = req.body.house_number;
            user.colony = req.body.colony;
            user.city = req.body.city;
            user.state = req.body.state;
            user.country = req.body.country;
            console.log("user before save is", user);
            user.save().then(user => {
                console.log("user collection part saved");
                Doctor_details.findOne().where({ _id: req.session.user._id }).exec().then(details => {
                    details.specializations = value_extractor(req.body.specializations);
                    details.qualifications = value_extractor(req.body.qualifications);

                    details.achievements = value_extractor(req.body.achievements);
                    details.hospitals - value_extractor(req.body.hospitals);
                    details.awards = value_extractor(req.body.awards);
                    details.experience = parseInt(req.body.experience);
                    details.fee = parseInt(req.body.fee);
                    details.description = req.body.description;
                    if (req.body.treatments != "") {
                        details.treatments = value_extractor(req.body.treatments);
                    }
                    details.save().then(details_updated => {
                        console.log("doctor details updated without error");
                        Users.findOne().where({ _id: req.session.user._id }).exec().then(user_updated => {
                            console.log("updated user is", user_updated);
                            req.session.user = user_updated;
                            res.redirect("/doctor_profile_edit");
                        });
                    }).catch(err => {
                        console.log("issue updating doctor details", err);
                    });
                }).catch(err => {
                    console.log("issue finding related doctor details", err);
                });
            }).catch(err => {
                console.log("issue updating user collection bit", err);
            });
        });
    }
    else {
        console.log("image present");
        new_profile_picture_upload(req, res, async err => {
            if (err) {
                console.log("error uploading", err);
            }
            else {
                await Users.findOne().where({ email: req.body.email }).exec().then(result => {
                    if (result != null && req.session.user.email != result.email) {
                        req.session.message = "Email already in use";
                        console.log("email already in use");
                        return res.redirect("/doctor_profile_edit");
                    }
                });
                await Users.findOne().where({ number: req.body.number }).exec().then(result => {
                    if (result != null && req.session.user.email != result.email) {
                        req.session.message = "Number already in use";
                        console.log("number already in use");
                        return res.redirect("/doctor_profile_edit");
                    }
                });
                console.log("req.file.location", req.file.location.toString());
                imageurl = req.file.location.toString();
                console.log("req.body after image upload is ", req.body);
                Users.findOne().where({ _id: req.session.user._id }).exec().then(user => {
                    console.log("user found");
                    user.profile_picture = imageurl;
                    user.name = req.body.name;
                    user.email = req.body.email;
                    user.number = parseInt(req.body.number);
                    user.gender = req.body.gender;
                    user.date = req.body.date;
                    user.timezone = req.body.timezone;
                    user.house_number = req.body.house_number;
                    user.colony = req.body.colony;
                    user.city = req.body.city;
                    user.state = req.body.state;
                    user.country = req.body.country;
                    console.log("user before save is", user);
                    user.save().then(user => {
                        console.log("user collection part saved");
                        Doctor_details.findOne().where({ _id: req.session.user._id }).exec().then(details => {
                            details.specializations = value_extractor(req.body.specializations);
                            details.qualifications = value_extractor(req.body.qualifications);
                            details.achievements = value_extractor(req.body.achievements);
                            details.hospitals - value_extractor(req.body.hospitals);
                            details.awards = value_extractor(req.body.awards);
                            details.experience = parseInt(req.body.experience);
                            details.fee = parseInt(req.body.fee);
                            details.description = req.body.description;
                            details.profile_picture = imageurl;
                            if (req.body.treatments != '') {
                                details.treatments = value_extractor(req.body.treatments);
                            }
                            details.save().then(details_updated => {
                                console.log("doctor details updated without error");
                                Users.findOne().where({ _id: req.session.user._id }).exec().then(user_updated => {
                                    console.log("updated user is", user_updated);
                                    req.session.user = user_updated;
                                    res.redirect("/doctor_profile_edit");
                                });
                            }).catch(err => {
                                console.log("issue updating doctor details", err);
                            });
                        }).catch(err => {
                            console.log("issue finding related doctor details", err);
                        });
                    }).catch(err => {
                        console.log("issue updating user collection bit", err);
                    });
                });
            }
        });
    }
}

var doctor_create_schedule = async(req, res) => {
    console.log("req.body here is ", req.body);
    console.log("req.body type of days :", typeof (req.body.day));

    if (typeof (req.body.day) == 'string') {
        console.log("single day input");
        var start_time = req.body.start_time.toString();
        console.log("start_time from body received is", start_time);
        var end_time = req.body.end_time.toString();
        var interval = parseInt(req.body.interval);
        var d = new Date(0);
        d.setHours(parseInt(start_time.split(":")[0]));
        d.setMinutes(parseInt(start_time.split(":")[1]));
        req.body.start_time = new Date(d.getTime());
        console.log("req.body.start_time after setting date:", req.body.start_time);
        var e = new Date(0);
        e.setHours(parseInt(end_time.split(":")[0]));
        e.setMinutes(parseInt(end_time.split(":")[1]));
        req.body.end_time = new Date(e.getTime());
        console.log("req.body.end_time after setting date:", req.body.end_time);
        start_time = req.body.start_time;
        end_time = req.body.end_time;
        req.body.doctor_id = req.session.user._id;
        Doctor_details.findOne().where({ _id: req.session.user._id }).select('schedules').populate('schedules').exec().then(result => {
            var terminated = false;
            if (result.schedules.length > 0) {
                for (i of result.schedules) {
                    if (i.day == req.body.day && req.body.start_time <= i.end_time && req.body.end_time >= i.start_time && i.doctor_id == req.session.user._id) {
                        console.log("One or all of the schedule you wanted to create overlaps with an existing schedule");
                        req.session.message = "Schedule(s) overlap,please check";
                        var terminated = true;
                        res.redirect("/doctor_create_schedule");
                    }
                }
            }
            if (terminated == false) {
                var slot_start_time = new Date(start_time.getTime());
                var slot_end_time = new Date(end_time.getTime());
                req.body.slots = [];
                console.log("slot_start_time , slot_end_time before entering while ", slot_start_time, slot_end_time);
                while (slot_start_time < slot_end_time) {
                    var obj = {};
                    obj.start_time = new Date(slot_start_time.getTime());
                    slot_start_time.setMinutes(slot_start_time.getMinutes() + interval);
                    if (slot_start_time <= slot_end_time) {
                        obj.end_time = new Date(slot_start_time.getTime());
                        obj.is_occupied = false;
                        req.body.slots.push(obj);
                    }

                }
                console.log("schedule made is", req.body);
                var schedule = new Schedules(req.body);
                schedule.save().then(result => {
                    console.log("schedule has been added to the collection with details as", result);
                    Doctor_details.findOne().where({ _id: req.session.user._id }).exec().then(details => {
                        if (details != null) {
                            console.log("doctor found where schedule needs to be pushed too");
                            details.schedules.push(schedule);
                            details.save().then(result => {
                                console.log("The schedule has been added to doctor details as well as", result);
                                req.session.message = "Schedule added successfully";
                                res.redirect("/doctor_create_schedule");
                            }).catch(err => {
                                console.log("There was an issue adding the schedule details to the doctor's details", err);
                                res.redirect("/doctor_create_schedule");
                            });
                        }
                    }).catch(err => {
                        console.log("There was an issue finding doctor details associated with the session user", err);
                        res.redirect("/doctor_create_schedule");
                    });
                }).catch(err => {
                    console.log("There was an issue saving the defined schedule", err);
                    res.redirect("/doctor_create_schedule");
                });
            }
        }).catch(err => {
            console.log("issue finding needed doctor details to check overlap condition", err);
            res.redirect("/doctor_create_schedule");
        });

    }

    else if (typeof (req.body.day) == "object") {
        console.log("multiple day input");
        var days_array = req.body.day;
        var start_time = req.body.start_time.toString();
        var end_time = req.body.end_time.toString();
        for (var i = 0; i < days_array.length; i++) {
            console.log("loop iteration number",i);
            req.body.day = days_array[i];
            console.log("start_time from body received is", start_time);
            var interval = parseInt(req.body.interval);
            var d = new Date(0);
            d.setHours(parseInt(start_time.split(":")[0]));
            d.setMinutes(parseInt(start_time.split(":")[1]));
            req.body.start_time = new Date(d.getTime());
            console.log("req.body.start_time after setting date:", req.body.start_time);
            var e = new Date(0);
            e.setHours(parseInt(end_time.split(":")[0]));
            e.setMinutes(parseInt(end_time.split(":")[1]));
            req.body.end_time = new Date(e.getTime());
            console.log("req.body.end_time after setting date:", req.body.end_time);
            var start_time_for_slots = req.body.start_time;
            var end_time_for_slots = req.body.end_time;
            req.body.doctor_id = req.session.user._id;
            await Doctor_details.findOne().where({ _id: req.session.user._id }).select('schedules').populate('schedules').exec().then(result => {
                var terminated = false;
                if (result.schedules.length > 0) {
                    for (k of result.schedules) {
                        if (k.day == req.body.day && req.body.start_time <= k.end_time && req.body.end_time >= k.start_time && k.doctor_id == req.session.user._id) {
                            console.log("One or all of the schedule you wanted to create overlaps with an existing schedule");
                            req.session.message = "Schedule(s) overlap,please check";
                            terminated = true;
                            res.redirect("/doctor_create_schedule");
                        }
                    }
                }
                if (terminated == false) {
                    var slot_start_time = new Date(start_time_for_slots.getTime());
                    var slot_end_time = new Date(end_time_for_slots.getTime());
                    req.body.slots = [];
                    console.log("slot_start_time , slot_end_time before entering while ", slot_start_time, slot_end_time);
                    while (slot_start_time < slot_end_time) {
                        var obj = {};
                        obj.start_time = new Date(slot_start_time.getTime());
                        slot_start_time.setMinutes(slot_start_time.getMinutes() + interval);
                        if (slot_start_time <= slot_end_time) {
                            obj.end_time = new Date(slot_start_time.getTime());
                            obj.is_occupied = false;
                            req.body.slots.push(obj);
                        }

                    }
                    console.log("schedule made is", req.body);
                    var schedule = new Schedules(req.body);
                    schedule.save().then(async result => {
                        console.log("schedule has been added to the collection with details as", result);
                        await Doctor_details.findOne().where({ _id: req.session.user._id }).exec().then(details => {
                            if (details != null) {
                                console.log("doctor found where schedule needs to be pushed too");
                                details.schedules.push(schedule);
                                details.save().then(result => {
                                    console.log("The schedule has been added to doctor details as well as", result);
                                    req.session.message = "Schedule added successfully";
                                }).catch(err => {
                                    console.log("There was an issue adding the schedule details to the doctor's details", err);
                                    res.redirect("/doctor_create_schedule");
                                });
                            }
                        }).catch(err => {
                            console.log("There was an issue finding doctor details associated with the session user", err);
                            res.redirect("/doctor_create_schedule");
                        });
                    }).catch(err => {
                        console.log("There was an issue saving the defined schedule", err);
                        res.redirect("/doctor_create_schedule");
                    });
                }
            }).catch(err => {
                console.log("issue finding needed doctor details to check overlap condition", err);
                res.redirect("/doctor_create_schedule");
            });
        }
        res.redirect("/doctor_create_schedule");
        
    }

}

var doctor_remove_schedule = (req,res) =>{
    var id = req.query.id;
    console.log("Id received to removed schedule number is",id);
    Doctor_details.findById(req.session.user._id).select('schedules').populate('schedules').exec().then(response =>{
        console.log("schedules found are",response);
        console.log("schedule to delete is",response.schedules[id]);
        var schedule_object_id = response.schedules[id]._id;
        console.log("schedule object id to be deleted is:",schedule_object_id);
        response.schedules.splice(id,1);
        response.save().then( result =>{
            console.log("schedule deleted from doctor_details is number",id);
            Schedules.findOneAndRemove({_id:schedule_object_id},{useFindAndModify: false}).exec().then(done =>{
                req.session.message = "Record updated successfully";
                res.redirect("/doctor_create_schedule");
            }).catch(err =>{
                console.log("error trying to delete a schedule",err);
            });
            
        }).catch(err =>{
            console.log("issue deleting schedule",err);
            res.redirect("/doctor_create_schedule");
        })
    }).catch(err =>{
        console.log("issue finding doctor with session details",err);
        res.redirect("/doctor_create_schedule");
    });
    
}

var toggle_schedule_active_state = (req,res) =>{
    var id = req.query.id; 
    console.log("schedule to be toggled is",id);
    Doctor_details.findById(req.session.user._id).select('schedules').exec().then(result => {
        var obj_id = result.schedules[id];
        Schedules.findById(obj_id).exec().then(schedule =>{
            schedule.is_active =false;
            for(var i= 0 ; i < schedule.slots.length ; i++){
                schedule.slots[i].is_active = false;
            }
            schedule.save().then(done =>{
                console.log("schedule has been marked inactive",done);
                res.status(200).send("updated");
            }).catch(err =>{
                console.log("error occured trying to update the schedule's active state",err);
                res.status(400).send("error occured");
            });
        }).catch(err =>{
            console.log("error finding schedule in schedules collection",err);
        });
    }).catch(err =>{
        console.log("couldn't find needed user or error occured",err);
        res.status(400).send("error occured");
    });
}

var toggle_schedule_inactive_state = (req,res) => {
    var id = req.query.id; 
    console.log("schedule to be toggled is",id);
    Doctor_details.findById(req.session.user._id).select('schedules').exec().then(result => {
        var obj_id = result.schedules[id];
        Schedules.findById(obj_id).exec().then(schedule =>{
            schedule.is_active =true;
            for(var i= 0 ; i < schedule.slots.length ; i++){
                schedule.slots[i].is_active = true;
            }
            schedule.save().then(done =>{
                console.log("schedule has been marked active",done);
                res.status(200).send("updated");
            }).catch(err =>{
                console.log("error occured trying to update the schedule's inactive state",err);
                res.status(400).send("error occured");
            });
        }).catch(err =>{
            console.log("error finding schedule in schedules collection",err);
        });
    }).catch(err =>{
        console.log("couldn't find needed user or error occured",err);
        res.status(400).send("error occured");
    });
}


var toggle_slot_inactive_state = (req,res) =>{
    var id = req.query.id;
    console.log(id);
    var schedule_id = id.split("_")[0];
    var slot_id = id.split("_")[1];
    console.log(schedule_id,slot_id);
    Doctor_details.findById(req.session.user._id).select('schedules').exec().then(result =>{
       var obj_id = result.schedules[schedule_id];
       Schedules.findById(obj_id).select('slots').exec().then( response => {
           response.slots[slot_id].is_active = false;
           response.save().then(updated_slot => {
               console.log("updated slot is",updated_slot);
               res.status(200).send("updated");
           }).catch(err => {
               console.log("could not update the slot state to inactive",err);
               res.status(400).send("error occured");
           });
       }).catch(err => {
           console.log("could not find the requested schedule in collection",err);
           res.status(400).send("error occured");
       });
    }).catch(err =>{
        console.log("could not find details related to requested doctor",err);
        res.status(400).send("error occured");
    });
}

var toggle_slot_active_state = (req,res) =>{
    var id = req.query.id;
    console.log(id);
    var schedule_id = id.split("_")[0];
    var slot_id = id.split("_")[1];
    console.log(schedule_id,slot_id);
    Doctor_details.findById(req.session.user._id).select('schedules').exec().then(result =>{
        var obj_id = result.schedules[schedule_id];
        Schedules.findById(obj_id).select('slots').exec().then( response => {
            response.slots[slot_id].is_active = true;
            response.save().then(updated_slot => {
                console.log("updated slot is",updated_slot);
                res.status(200).send("updated");
            }).catch(err => {
                console.log("could not update the slot state to inactive",err);
                res.status(400).send("error occured");
            });
        }).catch(err => {
            console.log("could not find the requested schedule in collection",err);
            res.status(400).send("error occured");
        });
     }).catch(err =>{
         console.log("could not find details related to requested doctor",err);
         res.status(400).send("error occured");
     });
}

var medical_records = (req,res) =>{
    medical_records_upload(req,res,err =>{
        if(err){
            console.log("Error occured",err);
        }
        else{
            Users.findById(req.session.user._id).exec().then(details =>{
                var date_split = req.body.date.split("-");
                for(j of date_split){
                    j= parseInt(j);
                }
                var date = new Date(0);
                date.setFullYear(date_split[0],date_split[1]-1,date_split[2]);
                req.body.date = date;
                console.log(date);
                req.body.uploads = [];
                for(i of req.files){
                    req.body.uploads.push(i.location);
                }
                console.log("final req.body is:",req.body);
                details.medical_records.push(req.body);
                details.save().then(done =>{
                    console.log("record added to database as",done);
                    req.session.message = "Added record successfully";
                    res.redirect("/medical_records");
                }).catch(err =>{
                    console.log("error occured trying to save the details",err);
                    res.redirect("/medical_records");
                })
            })
        }
    })
}

var medical_record_delete = (req,res) =>{
    console.log(req.body);
    var id = req.body.id;
    console.log("id received is",id);
    var split_id = id.split("record_");
    var id = parseInt(split_id[1]);
    console.log("record number to be deleted is",id);
    Users.findById(req.session.user._id).exec().then(details => {
        details.medical_records.splice(id,1);
        details.save().then(done =>{
            console.log("record delete successfully");
            req.session.message = "Record updated successfully";
            res.redirect("/medical_records");
        }).catch(err =>{
            console.log("error saving the deleted record details",err);
        });
    }).catch(err =>{
        console.log("Error finding the needed user",err);
    })
}

var medical_record_display = (req,res) =>{
    medical_records_upload(req,res,err =>{
        if(err){
            console.log(err);
        }
        else{
            var record_id = parseInt(req.query.id);
            Users.findById(req.session.user._id).select('medical_records').exec().then(details =>{
                for(var i = 0 ; i < req.files.length ; i++){
                    details.medical_records[record_id].uploads.push(req.files[i].location);
                }
                details.save().then(done =>{
                    console.log("added images to record");
                    record_id = record_id.toString();
                    var url = "/medical_record_display?id=" + record_id;
                    res.redirect(url);
                }).catch(err =>{
                    console.log("error saving new images to record",err);
                })
                
            }).catch(err =>{
                console.log("error finding user",err);
            })
        }
    })
}

var medical_record_display_delete = (req,res) =>{
    var file_id = parseInt(req.query.file_id);
    var record_id = parseInt(req.query.record_id);
    Users.findById(req.session.user._id).select('medical_records').exec().then(details =>{
        details.medical_records[record_id].uploads.splice(file_id,1);
        details.save().then(done =>{
            console.log("deleted file from record successfully");
            req.session.message= "Record updated successfully";
            res.status(200).send("updated");
        }).catch(err =>{
            console.log("could not update record",err);
        });
    }).catch(err =>{
        console.log("error finding the user",err);
    });
}

var get_doctor_available_slots = async (req, res) => {
    var id = req.query.id;
    var day_number = parseInt(req.query.day);
    var query_day = new Date();
    query_day.setHours(0);
    query_day.setMinutes(0);
    query_day.setSeconds(0);
    query_day.setMilliseconds(0);
    query_day.setDate(query_day.getDate() + day_number);
    console.log("!important, Date queried for is",query_day.toString());
    console.log("doctor id:", id);
    console.log("day_number:", day_number);

    var date_today = new Date();
    var day_today = date_today.getDay();
    function days(n){
        var days_list = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
        if(n>6){
            n=n-7;
        }
        return days_list[n];
    }
    var hospitals = [];
    await Doctor_details.findOne({_id:id}).select('hospitals').exec().then(doctor =>{
        hospitals = doctor.hospitals;
    }).catch(err =>{
        console.log("error finding user with given id",err);
    })

    var available_slots = [];
    //logic for obtaining available slots

    var doctor_id = id;
    var day_value = days(day_today+day_number);
    console.log("query for day:",day_value);

        available_slots = [];

        for (var k = 0; k < hospitals.length; k++) {//represents each hospital of doctor in schedules
            var hospital_value = hospitals[k].value;
            console.log("for hospital:",hospital_value);
            available_slots[k] = [];
            await Schedules.find({ doctor_id: doctor_id, is_active: true, hospital: hospital_value, day: day_value }).exec().then(details => {
                console.log('details are:',details);
                for (var x = 0; x < details.length; x++) {
                    if (details.length > 0) {
                        for (var l = 0; l < details[x].slots.length; l++) {//represent slots in that particular schedule
                            console.log("number of slots here are",details[x].slots.length);
                            if (day_number == 0) {
                                if (details[x].slots[l].is_active == true && details[x].slots[l].is_occupied == false && details[x].slots[l].start_time.getHours() > date_today.getHours()) {
                                    console.log("this is a valid slot",details[x].slots[l]);
                                    var includes = false;
                                    if(details[x].slots[l].booked_for){
                                        for(var m =0 ; m < details[x].slots[l].booked_for.length; m++){
                                            if(+details[x].slots[l].booked_for[m] == +query_day){
                                                includes = true;
                                            }
                                        }
                                    }
                                    if(includes == false){
                                        available_slots[k].push(details[x].slots[l].start_time);
                                    }
                                }
                            }
                            else {
                                if (details[x].slots[l].is_active == true && details[x].slots[l].is_occupied == false) {
                                    console.log("this is a valid slot",details[x].slots[l]);
                                    var includes = false;
                                    if(details[x].slots[l].booked_for){
                                        for(var m =0 ; m < details[x].slots[l].booked_for.length; m++){
                                            if(+details[x].slots[l].booked_for[m] == +query_day){
                                                includes = true;
                                            }
                                        }
                                    }
                                    if(includes == false){
                                        available_slots[k].push(details[x].slots[l].start_time);
                                    }
                                }
                            }
                        }
                    }
                }
            })
        }
        console.log("available_slot details:",available_slots);
    res.status(200).send(available_slots);
}

var book_appointment = (req,res) =>{
    var doctor_object_id = req.body.doctor_object_id;
    var slot_id = req.body.slot_id;
    var schedule_id = req.body.schedule_id;
    var date = req.body.booking_date;
    console.log("date captured is:",date);
    var booking_date = new Date(date);
    var patient_name = req.body.name;
    var patient_number = req.body.patient_number;
    var email = req.body.email;
    var start_time = req.body.start_time;
    var end_time = req.body.end_time;
    start_time = new Date(start_time);
    end_time = new Date(end_time);
    var obj = {};
    obj.schedule_id = schedule_id;
    obj.doctor_id = doctor_object_id;
    obj.user_id = req.session.user._id;
    obj.slot_id = slot_id;
    obj.patient_name = patient_name;
    obj.patient_number = patient_number;
    obj.patient_email = email;
    obj.start_time = start_time;
    obj.end_time  = end_time;
    obj.booking_date = booking_date;
    console.log("obj to be made appointment",obj);
    var appointment = new Appointments(obj);
    appointment.save().then(saved_appointment =>{
        console.log("appointment saved in Appointments");
        var appointment_id = saved_appointment._id;
        console.log("appointment id is:",appointment_id);
        Schedules.findById(schedule_id).exec().then(schedule =>{
            for(var i = 0 ; i < schedule.slots.length ; i++){
                if(schedule.slots[i]._id == slot_id){
                    schedule.slots[i].booked_for.push(booking_date);
                    console.log("found slot and pushed booking date");
                }
            }
            schedule.save().then(saved_schedule =>{
                console.log("added booking date in schedule's slot");
                Doctor_details.findById(doctor_object_id).exec().then(doctor_details =>{
                    doctor_details.appointments.push(appointment);
                    console.log("pushed instance of appointment in doctor_details");
                    doctor_details.save().then(saved_doctor_details =>{
                        console.log("instance of appointment saved in doctor details");
                        Users.findById(req.session.user._id).exec().then(user_details =>{
                            user_details.appointments.push(appointment);
                            console.log("instance of appointment has been pushed to user details");
                            user_details.save().then(saved_user_details =>{
                                console.log("user details were successfully saved as well");
                                req.session.booking_details ={...obj};
                                req.session.booking_details.appointment_id = appointment_id;
                                req.session.booking_made = true;
                                res.redirect("/booking_status");
                            }).catch(err =>{
                                console.log(err);
                            })
                        }).catch(err =>{
                            console.log(err);
                        })
                    }).catch(err =>{
                        console.log(err);
                    })
                }).catch(err =>{
                    console.log(err);
                })
            })
        }).catch(err =>{
            console.log(err);
        })
    }).catch(err =>{
        console.log(err);
    })

}

var cancel_last_booking = (req,res) =>{
    var appointment_id = req.session.booking_details.appointment_id;
    console.log("appointment to be cancelled is:",appointment_id);
    var needed_details = {};
    Appointments.findByIdAndRemove(appointment_id,{useFindAndModify:false}).exec().then(deleted_appointment =>{
        needed_details = deleted_appointment;
        console.log("deleted_appointment is :",needed_details);
        Schedules.findById(needed_details.schedule_id).exec().then(schedule =>{
            console.log("found the schedule needed");
            for(var i = 0 ; i < schedule.slots.length ; i++){
                if(schedule.slots[i]._id == needed_details.slot_id.toString()){
                    console.log("found slot to delete booking date from");
                    for(var j = 0 ; j < schedule.slots[i].booked_for.length ; j++){
                        if(+schedule.slots[i].booked_for[j] == +needed_details.booking_date){
                            schedule.slots[i].booked_for.splice(j,1);
                            console.log("removed the date from booked_for in slots");
                            schedule.save().then(saved_schedule =>{
                                console.log("saved the schedule with booking date removed");
                                Doctor_details.findById(needed_details.doctor_id).exec().then(details =>{
                                    for(var k = 0 ; k < details.appointments.length ; k++){
                                        if(details.appointments[k]== appointment_id){
                                            details.appointments.splice(k,1);
                                            console.log("removed appointment id from doctor_details");
                                            details.save().then(saved_details =>{
                                                console.log("successfully saved back doctor_details");
                                                Users.findById(needed_details.user_id).exec().then(user_details =>{
                                                    for(var l = 0 ; l < user_details.appointments.length ; l++){
                                                        if(user_details.appointments[l] == appointment_id){
                                                            user_details.appointments.splice(l,1);
                                                            console.log("removed appointment id from user details");
                                                            user_details.save().then(saved_user_details =>{
                                                                console.log("saved user_details successfully");
                                                                delete req.session.booking_details;
                                                                delete req.session.booking_made;
                                                                req.session.message = "Cancelled Booking successfully";
                                                                res.redirect("/all_appointments");
                                                            }).catch(err =>{
                                                                console.log(err);
                                                            });
                                                        }
                                                    }
                                                }).catch(err =>{
                                                    console.log(err);
                                                });
                                            }).catch(err =>{
                                                console.log(err);
                                            });
                                        }
                                    }
                                }).catch(err =>{
                                    console.log(err);
                                });
                            }).catch(err =>{
                                console.log(err);
                            });
                        }
                    }
                }
            }
        }).catch(err =>{
            console.log("cannot find the needed schedule",err);
        });
        
    }).catch(err =>{
        console.log(err);
    });
}

var confirm_reschedule_last_booking =(req,res) =>{
    function days(n) {
        var days_list = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        if (n > 6) {
            n = n - 7;
        }
        return days_list[n];
    }
    var hospital_number = parseInt(req.query.hospital_number);
    var day_number = parseInt(req.query.day_number);
    console.log("day_number_is:",day_number);
    var slot_start_time = req.query.time;
    var appointment_id = req.query.appointment_id;
    var twelve_hour = 0;
    if(slot_start_time.split(" ")[1]=="PM"){
        twelve_hour = 12;
    }
    var hours = parseInt(slot_start_time.split(":")[0])+twelve_hour;
    var minutes = parseInt(slot_start_time.split(":")[1]);
    console.log("hours minutes PM",hours,minutes,twelve_hour);
    var new_booking_date = new Date();
    console.log("date is",new_booking_date.getDate());
    console.log("unset new booking date is:",new_booking_date.toString());
    new_booking_date.setDate(new_booking_date.getDate() + day_number);
    new_booking_date.setHours(0);
    new_booking_date.setMinutes(0);
    new_booking_date.setSeconds(0);
    new_booking_date.setMilliseconds(0);
    console.log(new_booking_date.toString());
    var new_slot_start_time = new Date(0);
    new_slot_start_time.setHours(hours);
    new_slot_start_time.setMinutes(minutes);
    var new_day = days(new_booking_date.getDay());
    Appointments.findById(appointment_id).exec().then(appointment_details =>{
        Schedules.findById(appointment_details.schedule_id).exec().then(schedule =>{
            console.log("found schedule to remove previous booking from");
            for(var i = 0 ; i < schedule.slots.length ; i++){
                if(schedule.slots[i]._id == appointment_details.slot_id.toString()){
                    console.log("found slot to remove previous booking from");
                    for(var j= 0 ; j < schedule.slots[i].booked_for.length; j++){
                        if(+schedule.slots[i].booked_for[j]==+appointment_details.booking_date){
                            schedule.slots[i].booked_for.splice(j,1);
                            console.log("found previous booking date and removed it");
                            schedule.save().then(saved_schedule =>{
                                console.log("successfully saved the removed booking date schedule");
                                Doctor_details.findById(appointment_details.doctor_id).populate('schedules').exec().then(details =>{
                                    for (var i = 0; i < details.schedules.length; i++) {
                                        if (details.schedules[i].day == new_day && details.schedules[i].hospital == details.hospitals[hospital_number].value) {
                                            console.log("found needed schedule");
                                            for (var j = 0; j < details.schedules[i].slots.length; j++) {
                                                if (+details.schedules[i].slots[j].start_time == +new_slot_start_time) {
                                                    console.log("found needed new slot to extract ids");
                                                    var new_schedule_id = details.schedules[i]._id;
                                                    var new_slot_id = details.schedules[i].slots[j]._id;
                                                    console.log("extracted new ids");
                                                    Schedules.findById(new_schedule_id).exec().then(new_schedule =>{
                                                        console.log("found and entered new schedule");
                                                        for(var k = 0;k < new_schedule.slots.length;k++){
                                                            if(new_schedule.slots[k]._id == new_slot_id.toString()){
                                                                console.log("found and entered new slot");
                                                                if(new_schedule.slots[k].booked_for){
                                                                    new_schedule.slots[k].booked_for.push(new_booking_date);
                                                                    console.log("added new booking date to booked for array of the slot");
                                                                }
                                                                else{
                                                                    new_schedule.slots[k].booked_for = [];
                                                                    new_schedule.slots[k].booked_for.push(new_booking_date);
                                                                    console.log("added new booking date to booked for array of the slot");
                                                                }
                                                                var new_slot_end_time = new Date(new_schedule.slots[k].end_time.getTime());
                                                            }
                                                        }
                                                        new_schedule.save().then(saved_ne_schedule =>{
                                                            console.log("successfully saved the new_schedule with added booking date");
                                                            Appointments.findById(appointment_id).exec().then(appointment =>{
                                                                appointment.start_time = new_slot_start_time;
                                                                appointment.end_time = new_slot_end_time;
                                                                appointment.schedule_id = new_schedule_id;
                                                                appointment.slot_id = new_slot_id;
                                                                appointment.booking_date = new_booking_date;
                                                                appointment.save().then(done =>{
                                                                    console.log("made needed changes to appointment as well");
                                                                    console.log("new appointment is:",done);
                                                                    console.log("start_time for new appointment is:",done.start_time.toString());
                                                                    req.session.message = "Reschedule executed successfully";
                                                                    res.redirect("/all_appointments");
                                                                }).catch(err =>{
                                                                    console.log(err);
                                                                });
                                                            }).catch(err =>{
                                                                console.log(err);
                                                            });
                                                        }).catch(err =>{
                                                            console.log(err);
                                                        });
                                                        
                                                    }).catch(err =>{
                                                        console.log(err);
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }).catch(err =>{
                                    console.log(err);
                                });
                            }).catch(err =>{
                                console.log(err);
                            });
                        }
                    }
                }
            }
        }).catch(err =>{
            console.log(err);
        });
    }).catch(err =>{
        console.log(err);
    });
}

var cancel_appointment = (req,res) =>{
    var appointment_id = req.body.appointment_id;

    console.log("appointment to be cancelled is:",appointment_id);
    var needed_details = {};
    Appointments.findByIdAndRemove(appointment_id,{useFindAndModify:false}).exec().then(deleted_appointment =>{
        needed_details = deleted_appointment;
        console.log("deleted_appointment is :",needed_details);
        Schedules.findById(needed_details.schedule_id).exec().then(schedule =>{
            console.log("found the schedule needed");
            for(var i = 0 ; i < schedule.slots.length ; i++){
                if(schedule.slots[i]._id == needed_details.slot_id.toString()){
                    console.log("found slot to delete booking date from");
                    for(var j = 0 ; j < schedule.slots[i].booked_for.length ; j++){
                        if(+schedule.slots[i].booked_for[j] == +needed_details.booking_date){
                            schedule.slots[i].booked_for.splice(j,1);
                            console.log("removed the date from booked_for in slots");
                            schedule.save().then(saved_schedule =>{
                                console.log("saved the schedule with booking date removed");
                                Doctor_details.findById(needed_details.doctor_id).exec().then(details =>{
                                    for(var k = 0 ; k < details.appointments.length ; k++){
                                        if(details.appointments[k]== appointment_id){
                                            details.appointments.splice(k,1);
                                            console.log("removed appointment id from doctor_details");
                                            details.save().then(saved_details =>{
                                                console.log("successfully saved back doctor_details");
                                                Users.findById(needed_details.user_id).exec().then(user_details =>{
                                                    for(var l = 0 ; l < user_details.appointments.length ; l++){
                                                        if(user_details.appointments[l] == appointment_id){
                                                            user_details.appointments.splice(l,1);
                                                            console.log("removed appointment id from user details");
                                                            user_details.save().then(saved_user_details =>{
                                                                console.log("saved user_details successfully");
                                                                delete req.session.booking_details;
                                                                delete req.session.booking_made;
                                                                req.session.message = "Cancelled Booking successfully";
                                                                res.redirect("/all_appointments");
                                                            }).catch(err =>{
                                                                console.log(err);
                                                            });
                                                        }
                                                    }
                                                }).catch(err =>{
                                                    console.log(err);
                                                });
                                            }).catch(err =>{
                                                console.log(err);
                                            });
                                        }
                                    }
                                }).catch(err =>{
                                    console.log(err);
                                });
                            }).catch(err =>{
                                console.log(err);
                            });
                        }
                    }
                }
            }
        }).catch(err =>{
            console.log("cannot find the needed schedule",err);
        });
        
    }).catch(err =>{
        console.log(err);
    });
}

var change_password_settings = (req,res) =>{
    var current_password = req.body.current_password;
    var new_password = req.body.new_password;
    if(current_password != req.session.user.password){
        console.log("incorrect current Password");
        req.session.message= "Incorrect Current Password";
        res.redirect("/change_password_settings");
    }
    else{
        console.log("Correct current Password");
        Users.findById(req.session.user._id).exec().then(user_details =>{
            console.log("found user to update Password");
            user_details.password = new_password;
            user_details.save().then(saved_user =>{
                req.session.user = saved_user;
                console.log("changed Password Successfully");
                req.session.message = "Password Changed Successfully";
                res.redirect("/change_password_settings");
            }).catch(err =>{
                console.log(err);
            });
        }).catch(err =>{
            console.log(err);
        });
    }
}

module.exports = {
    signup: signup,
    email_login: email_login,
    forgot_password_email: forgot_password_email,
    forgot_password_otp: forgot_password_otp,
    resend_otp: resend_otp,
    update_password: update_password,
    resend_otp_login: resend_otp_login,
    otp_login_number: otp_login_number,
    otp_login_otp: otp_login_otp,
    doctor_details_form: doctor_details_form,
    user_profile_edit: user_profile_edit,
    doctor_profile_edit: doctor_profile_edit,
    doctor_create_schedule: doctor_create_schedule,
    doctor_remove_schedule:doctor_remove_schedule,
    toggle_schedule_active_state: toggle_schedule_active_state,
    toggle_schedule_inactive_state:toggle_schedule_inactive_state,
    toggle_slot_active_state:toggle_slot_active_state,
    toggle_slot_inactive_state:toggle_slot_inactive_state,
    medical_records:medical_records,
    medical_record_delete:medical_record_delete,
    medical_record_display:medical_record_display,
    medical_record_display_delete:medical_record_display_delete,
    get_doctor_available_slots:get_doctor_available_slots,
    book_appointment:book_appointment,
    cancel_last_booking:cancel_last_booking,
    confirm_reschedule_last_booking: confirm_reschedule_last_booking,
    cancel_appointment:cancel_appointment,
    change_password_settings:change_password_settings
}