const express = require("express");
const e = require("express");
const { Appointments } = require("../databases/mongodb");
const app = express();
const dbconn = require("../databases/mongodb");
const Doctor_details = dbconn.Doctor_details;
const Users = dbconn.Users;
const Schedules = dbconn.Schedules;

var index = (req, res) => {
    if (req.session.message && req.session.message != "") {
        var message = req.session.message;
    }
    else {
        var message = "";
    }
    delete req.session.message;
    if (req.session.user) {
        var loggedinstatus = true;
        // console.log("User here",req.session.user);
        res.render("index", {
            user: req.session.user,
            loggedinstatus: loggedinstatus,
            message: message
        });
    }
    else {
        var loggedinstatus = false;
        res.render("index", {
            loggedinstatus: loggedinstatus,
            message: message
        });
    }

}

var doctor = async (req, res) => {
    var dynamic_filters = req.session.filters;
    console.log("dynamic_filters controller:",dynamic_filters);
    delete req.session.filters;
    var date_today = new Date();
    var day_today = date_today.getDay();
    if(req.session.message && req.session.message!= ""){
        var message = req.session.message;
    }
    else{
        var message = "";
    }
    delete req.session.message;
    function days(n) {
        var days_list = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        if (n > 6) {
            n = n - 7;
        }
        return days_list[n];
    }

    console.log("today is:", day_today);
    var filter_values = [];
    var filter_type_count = 0;
    if (req.session.doctor_filters) {
        if (req.session.doctor_filters.city_array) {
            var city_array = req.session.doctor_filters.city_array;
            if(req.session.doctor_filters.user_query_part.city){
                filter_type_count++;
            }
            console.log("array is", city_array);
        }

        if (req.session.doctor_filters.hospitals_array) {
            var hospitals_array = req.session.doctor_filters.hospitals_array;
            if(req.session.doctor_filters.doctor_details_query_part.hospitals){
                filter_type_count++;
            }
        }

        if (req.session.doctor_filters.treatments_array) {
            var treatments_array = req.session.doctor_filters.treatments_array;
            if(req.session.doctor_filters.doctor_details_query_part.treatments){
                filter_type_count++;
            }
        }

        if (req.session.doctor_filters.experience) {
            var experience = req.session.doctor_filters.experience;
            if(req.session.doctor_filters.doctor_details_query_part.experience){
                filter_type_count++;
            }
        }
        if (req.session.doctor_filters.filter_values) {
            filter_values = req.session.doctor_filters.filter_values;
        }
    }

    if (req.session.new_filter) {
        if (req.session.doctor_filters.sort_by) {
            delete req.session.doctor_filters.sort_by;
        }
        if(!req.query.page_requested){
            delete req.session.new_filter;
        }
    }

    var page_requested = 1;
    if (req.query.page_requested) {
        console.log("page_requested in query is", req.query.page_requested);
        console.log("current page in query is", req.query.current_page);
        if (req.query.page_requested == 'previous') {
            page_requested = parseInt(req.query.current_page) - 1;
        }
        else if (req.query.page_requested == 'next') {
            page_requested = parseInt(req.query.current_page) + 1;
        }
        else {
            page_requested = parseInt(req.query.page_requested);
            if (req.session.new_filter) {
                page_requested = 1;
                delete req.session.new_filter;
            }
        }
    }
    else {
        console.log("no query in this request")
    }
    var pages_needed = 0;
    var current_page = page_requested;
    var limit = 5;
    var skip = (current_page - 1) * limit;
    if (!req.session.doctor_filters) {
        req.session.doctor_filters = {};
        req.session.doctor_filters.user_query_part = {};
        req.session.doctor_filters.user_query_part.is_doctor = true;
        req.session.doctor_filters.filter_values = [];
        console.log(req.session.doctor_filters.user_query_part);
    }
    await Users.find(req.session.doctor_filters.user_query_part).exec().then(async doctors => {
        pages_needed = Math.ceil(doctors.length / 5);
        console.log("value of pages needed after ceil is", pages_needed);
    }).catch(err => {
        console.log(err);
    });
    if (req.session.user) {
        var name_sort = "";
        var sort_by = "";
        if (req.session.doctor_filters.sort_by) {
            sort_by = req.session.doctor_filters.sort_by;
            console.log("Need to sort by", sort_by);
            if (sort_by == "name" || sort_by == "-name") {
                console.log("sort matched");
                name_sort = sort_by;
            }
        }
        var doctor_list = [];
        Users.find(req.session.doctor_filters.user_query_part).select('_id name city').sort(name_sort).exec().then(async doctors => {
            if (req.session.doctor_filters.doctor_details_query_part) {
                delete req.session.doctor_filters.doctor_details_query_part._id;
                await Doctor_details.find(req.session.doctor_filters.doctor_details_query_part).exec().then(after_filter => {
                    if(!(filter_type_count==1 && req.session.doctor_filters.user_query_part.city)){
                        pages_needed = Math.ceil(after_filter.length / 5);
                        console.log("value of pages needed after-filter ceil is", pages_needed);
                    }
                })
            }
            for (i of doctors) {
                if (!req.session.doctor_filters.doctor_details_query_part) {
                    req.session.doctor_filters.doctor_details_query_part = {};
                    req.session.doctor_filters.doctor_details_query_part._id = i._id;
                    console.log(req.session.doctor_filters.doctor_details_query_part);
                }
                else {
                    req.session.doctor_filters.doctor_details_query_part._id = i._id;
                    console.log(req.session.doctor_filters.doctor_details_query_part);
                }
                await Doctor_details.findOne(req.session.doctor_filters.doctor_details_query_part).exec().then(details => {
                    if (details != null) {
                        i = i.toObject();
                        details = details.toObject();
                        var obj = Object.assign(i, details);
                        // console.log("object after assign is", obj);
                        doctor_list.push(obj);
                        obj = {};
                    }
                }).catch(err => {
                    console.log("no details found for this doctor", err);
                })
            }
            // console.log("doctor_list here", doctor_list);
            // adding slot_numbers to doctor_list
            for (var i = 0; i < doctor_list.length; i++) {
                doctor_list[i].slot_numbers = [0, 0, 0, 0, 0, 0, 0];
                await Doctor_details.findById(doctor_list[i]._id).select('schedules').populate('schedules').exec().then(details => {
                    for (var j = 0; j < 7; j++) {
                        for (var k = 0; k < details.schedules.length; k++) {
                            if (details.schedules[k].is_active == true) {
                                if (details.schedules[k].day == days(day_today + j)) {
                                    var query_day = new Date();
                                    query_day.setHours(0);
                                    query_day.setMinutes(0);
                                    query_day.setSeconds(0);
                                    query_day.setMilliseconds(0);
                                    query_day.setDate(query_day.getDate() + j);
                                    for (var l = 0; l < details.schedules[k].slots.length; l++) {
                                        if (j == 0) {

                                            if (details.schedules[k].slots[l].is_active == true && details.schedules[k].slots[l].is_occupied == false && details.schedules[k].slots[l].start_time.getHours() > date_today.getHours()) {

                                                var includes = false;
                                                if (details.schedules[k].slots[l].booked_for) {
                                                    for (var m = 0; m < details.schedules[k].slots[l].booked_for.length; m++) {
                                                        if (+details.schedules[k].slots[l].booked_for[m] == +query_day) {
                                                            includes = true;
                                                        }
                                                    }
                                                }
                                                if (includes == false) {
                                                    doctor_list[i].slot_numbers[j]++;
                                                }
                                            }
                                        }
                                        else {
                                            if (details.schedules[k].slots[l].is_active == true && details.schedules[k].slots[l].is_occupied == false) {
                                                var includes = false;
                                                if (details.schedules[k].slots[l].booked_for) {
                                                    for (var m = 0; m < details.schedules[k].slots[l].booked_for.length; m++) {
                                                        if (+details.schedules[k].slots[l].booked_for[m] == +query_day) {
                                                            includes = true;
                                                        }
                                                    }
                                                }
                                                if (includes == false) {
                                                    doctor_list[i].slot_numbers[j]++;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
            }
            console.log("finished slot_numbers part");
            // sorting according to fee and experience(if applicable)
            if (sort_by == "fee" || sort_by == "-fee") {
                console.log("fee sort entered");
                doctor_list.sort(function compare(a, b) {
                    // Use toUpperCase() to ignore character casing
                    const feeA = a.fee;
                    const feeB = b.fee;

                    let comparison = 0;
                    if (feeA > feeB) {
                        comparison = 1;
                    } else if (feeA < feeB) {
                        comparison = -1;
                    }
                    if (sort_by == "fee") {
                        console.log("achieved ascending sort");
                        return comparison;
                    }
                    else if (sort_by == "-fee") {
                        console.log("achieved descending sort");
                        return comparison * -1;
                    }

                })
            }
            if (sort_by == "experience" || sort_by == "-experience") {
                console.log("experience sort entered");
                doctor_list.sort(function compare(a, b) {
                    // Use toUpperCase() to ignore character casing
                    const experienceA = a.experience;
                    console.log(experienceA);
                    const experienceB = b.experience;
                    console.log(experienceB);

                    let comparison = 0;
                    if (experienceA > experienceB) {
                        comparison = 1;
                    } else if (experienceA < experienceB) {
                        comparison = -1;
                    }
                    if (sort_by == "experience") {
                        console.log("achieved ascending sort", comparison);
                        return comparison;
                    }
                    else if (sort_by == "-experience") {
                        console.log("achieved descending sort", comparison);
                        return comparison * -1;
                    }

                })
            }
            var final_doctor_list = [];
            for (var j = skip; j < skip + 5; j++) {
                if (doctor_list[j]) {
                    final_doctor_list.push(doctor_list[j]);
                }
            }
            doctor_list = final_doctor_list;
            console.log("doctor list finalised is", doctor_list);
            var loggedinstatus = true;
            res.render("doctor", {
                user: req.session.user,
                loggedinstatus: loggedinstatus,
                doctor_list: doctor_list,
                pages_needed: pages_needed,
                current_page: current_page,
                city_array: city_array,
                hospitals_array: hospitals_array,
                treatments_array: treatments_array,
                experience: experience,
                filter_values: filter_values,
                sort_by: sort_by,
                message:message,
                dynamic_filters:dynamic_filters
            });
        }).catch(err => {
            console.log("error finding any doctors", err);
        });
    }
    else {
        var loggedinstatus = false;
        res.render("doctor", {
            loggedinstatus: loggedinstatus
        });
    }
}

var otp_login_number = (req, res) => {
    if (req.session.message && req.session.message != "") {
        var message = req.session.message;
    }
    else {
        var message = "";
    }
    res.render("otp_login_number", {
        message: message
    });
}

var otp_login_otp = (req, res) => {
    if (req.session.message && req.session.message != "") {
        var message = req.session.message;
    }
    else {
        var message = "";
    }
    delete req.session.message;
    res.render("otp_login_otp", {
        message: message
    });
}

var hospital = (req, res) => {
    if (req.session.user) {
        var loggedinstatus = true;
        console.log("User here", req.session.user)
        res.render("hospital", {
            user: req.session.user,
            loggedinstatus: loggedinstatus
        });
    }
    else {
        var loggedinstatus = false;
        res.render("hospital", {
            loggedinstatus: loggedinstatus
        });
    }
}

var signup = (req, res) => {
    if (req.session.message && req.session.message != "") {
        var message = req.session.message;
    }
    else {
        var message = "";
    }
    delete req.session.message;
    res.render("signup", {
        message
    });
}

var contactus = (req, res) => {
    if (req.session.user) {
        var loggedinstatus = true;
        console.log("User here", req.session.user)
        res.render("contactus", {
            user: req.session.user,
            loggedinstatus: loggedinstatus
        });
    }
    else {
        var loggedinstatus = false;
        res.render("contactus", {
            loggedinstatus: loggedinstatus
        });
    }
}
var dentistry = (req, res) => {
    if (req.session.user) {
        var loggedinstatus = true;
        console.log("User here", req.session.user)
        res.render("dentistry", {
            user: req.session.user,
            loggedinstatus: loggedinstatus
        });
    }
    else {
        var loggedinstatus = false;
        res.render("dentistry", {
            loggedinstatus: loggedinstatus
        });
    }
}

var appointment = (req, res) => {
    if (req.session.user) {
        var loggedinstatus = true;
        console.log("User here", req.session.user)
        res.render("appointment", {
            user: req.session.user,
            loggedinstatus: loggedinstatus
        });
    }
    else {
        var loggedinstatus = false;
        res.render("appointment", {
            loggedinstatus: loggedinstatus
        });
    }
}

var aboutus = (req, res) => {
    if (req.session.user) {
        var loggedinstatus = true;
        console.log("User here", req.session.user)
        res.render("aboutus", {
            user: req.session.user,
            loggedinstatus: loggedinstatus
        });
    }
    else {
        var loggedinstatus = false;
        res.render("aboutus", {
            loggedinstatus: loggedinstatus
        });
    }
}

var doctor_profile = (req, res) => {
    if (req.session.user) {
        var loggedinstatus = true;
        console.log("User here", req.session.user)
        res.render("doctor_profile", {
            user: req.session.user,
            loggedinstatus: loggedinstatus
        });
    }
    else {
        var loggedinstatus = false;
        res.render("doctor_profile", {
            loggedinstatus: loggedinstatus
        });
    }
}

var faq = (req, res) => {
    if (req.session.user) {
        var loggedinstatus = true;
        console.log("User here", req.session.user)
        res.render("faq", {
            user: req.session.user,
            loggedinstatus: loggedinstatus
        });
    }
    else {
        var loggedinstatus = false;
        res.render("faq", {
            loggedinstatus: loggedinstatus
        });
    }
}

var hospital_profile = (req, res) => {
    if (req.session.user) {
        var loggedinstatus = true;
        console.log("User here", req.session.user)
        res.render("hospital_profile", {
            user: req.session.user,
            loggedinstatus: loggedinstatus
        });
    }
    else {
        var loggedinstatus = false;
        res.render("hospital_profile", {
            loggedinstatus: loggedinstatus
        });
    }
}

var submit_query = (req, res) => {
    if (req.session.user) {
        var loggedinstatus = true;
        console.log("User here", req.session.user)
        res.render("submit_query", {
            user: req.session.user,
            loggedinstatus: loggedinstatus
        });
    }
    else {
        var loggedinstatus = false;
        res.render("submit_query", {
            loggedinstatus: loggedinstatus
        });
    }
}

var plus = (req, res) => {
    if (req.session.user) {
        var loggedinstatus = true;
        console.log("User here", req.session.user)
        res.render("plus", {
            user: req.session.user,
            loggedinstatus: loggedinstatus
        });
    }
    else {
        var loggedinstatus = false;
        res.render("plus", {
            loggedinstatus: loggedinstatus
        });
    }
}

var email_login = (req, res) => {
    if (req.session.message && req.session.message != "") {
        var message = req.session.message;
    }
    else {
        var message = "";
    }
    delete req.session.message;
    res.render("email_login", {
        message: message
    });
}

var logout = (req, res) => {
    req.session.destroy(() => {
        console.log("Logged out");
    });
    res.redirect("/email_login");
}

var forgot_password_email = (req, res) => {
    if (req.session.message && req.session.message != "") {
        var message = req.session.message;
    }
    else {
        var message = "";
    }
    delete req.session.message;
    res.render("forgot_password_email", {
        message: message
    });
}

var forgot_password_otp = (req, res) => {
    if (req.session.message && req.session.message != "") {
        var message = req.session.message;
    }
    else {
        var message = "";
    }
    delete req.session.message;
    res.render("forgot_password_otp", {
        message: message
    });
}

var update_password = (req, res) => {
    
    if (req.session.otp_verified && req.session.otp_verified == true) {
        if (req.session.message && req.session.message != "") {
            var message = req.session.message;
        }
        else {
            var message = "";
        }
        delete req.session.message;
        res.render("update_password", {
            message,
            user:req.session.temp_user
        });
    }
    else {
        console.log("Invalid access");
        res.redirect("/");
    }
}

var doctor_details_form = (req, res) => {
    if (req.session.message && req.session.message != "") {
        var message = req.session.message;
    }
    else {
        var message = "";
    }
    if (req.session.user) {
        var loggedinstatus = true;
    }
    else {
        var loggedinstatus = false;
    }
    res.render("doctor_details_form", {
        user: req.session.user,
        message: message,
        loggedinstatus
    });
}

var user_profile_edit = (req, res) => {
    if (req.session.message && req.session.message != "") {
        var message = req.session.message;
    }

    else {
        var message = "";
    }
    delete req.session.message;
    if (req.session.user) {
        var loggedinstatus = true;
    }
    else {
        var loggedinstatus = false;
    }
    res.render("user_profile_edit", {
        user: req.session.user,
        message: message,
        loggedinstatus
    });
}

var doctor_profile_edit = (req, res) => {
    if (req.session.message && req.session.message != "") {
        var message = req.session.message;
    }
    else {
        var message = "";
    }
    delete req.session.message;
    if (req.session.user) {
        var loggedinstatus = true;
    }
    else {
        var loggedinstatus = false;
    }
    Doctor_details.findOne().where({ _id: req.session.user._id }).exec().then(details => {
        console.log("details retreived as", details);
        var doctor_details = details.toObject();
        res.render("doctor_profile_edit", {
            user: req.session.user,
            message: message,
            loggedinstatus,
            doctor_details: doctor_details
        });
    })

}

var doctor_create_schedule = (req, res) => {
    if (req.session.message && req.session.message != "") {
        var message = req.session.message;
    }
    else {
        var message = "";
    }
    delete req.session.message;
    if (req.session.user) {
        var loggedinstatus = true;
    }
    else {
        var loggedinstatus = false;
    }
    Doctor_details.findOne().where({ _id: req.session.user._id }).populate('schedules').exec().then(details => {
        var doctor_details = details.toObject();
        console.log("details received as", doctor_details);
        res.render("doctor_create_schedule", {
            message: message,
            loggedinstatus: loggedinstatus,
            user: req.session.user,
            doctor_details: doctor_details
        });
    })
}

var medical_records = (req, res) => {
    if (req.session.user) {
        var loggedinstatus = true;
    }
    else {
        var loggedinstatus = false;
    }
    if (req.session.message && req.session.message != "") {
        var message = req.session.message;
    }
    else {
        var message = "";
    }
    delete req.session.message;
    Users.findById(req.session.user._id).exec().then(details => {
        req.session.user = details;
        res.render("medical_records", {
            message: message,
            loggedinstatus: loggedinstatus,
            user: req.session.user
        });
    }).catch(err => {
        console.log(err);
    })

}

var medical_record_display = (req, res) => {
    if (req.session.user) {
        var loggedinstatus = true;
    }
    else {
        var loggedinstatus = false;
    }
    if (req.session.message && req.session.message != "") {
        var message = req.session.message;
    }
    else {
        var message = "";
    }
    delete req.session.message;
    var id = parseInt(req.query.id);
    Users.findById(req.session.user._id).select('medical_records').exec().then(details => {
        var record = details.medical_records[id];
        res.render("medical_record_display", {
            loggedinstatus,
            record,
            message,
            user: req.session.user,
            record_id: id
        });
    })

}

var book_appointment = (req, res) => {
    if (req.session.message && req.session.message != "") {
        var message = req.session.message;
    }
    else {
        var message = "";
    }
    if (req.session.user) {
        var loggedinstatus = true;
    }
    else {
        var loggedinstatus = false;
    }
    
    delete req.session.message;

    function days(n) {
        var days_list = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        if (n > 6) {
            n = n - 7;
        }
        return days_list[n];
    }

    var doctor_object_id = req.query.id;
    //checking if doctor is appointing themself for their own treatment
    if(doctor_object_id == req.session.user._id){
        req.session.message = "You cannot appoint yourself";
        res.redirect("/doctor");
    }
    var hospital_number = parseInt(req.query.hospital_number);
    var day_number = parseInt(req.query.day_number);
    var slot_start_time = req.query.time;
    var date_today = new Date();
    date_today.setDate(date_today.getDate() + day_number);
    var after_12 = 0;
    if (slot_start_time.split(" ")[1] == "PM") {
        after_12 = 12;
    }
    var hours = parseInt(slot_start_time.split(":")[0]) + after_12;
    console.log("hours extracted are:", hours);
    var minutes = parseInt(slot_start_time.split(":")[1]);
    console.log("minutes extracted are:", minutes);
    date_today.setSeconds(0);
    date_today.setMilliseconds(0);
    date_today.setHours(hours);
    date_today.setMinutes(minutes);
    var booking_date = date_today.toString();
    console.log("booking for:", booking_date);
    var day = days(date_today.getDay());
    slot_start_time = new Date(0);
    slot_start_time.setHours(date_today.getHours());
    slot_start_time.setMinutes(date_today.getMinutes());
    // console.log("to match date is:",slot_start_time.toString());
    var doctor_details = {};
    var slot_details = {};
    Doctor_details.findById(doctor_object_id).populate('schedules').exec().then(details => {
        // console.log("details:", details);
        doctor_details = details;
        for (var i = 0; i < details.schedules.length; i++) {
            if (details.schedules[i].day == day && details.schedules[i].hospital == details.hospitals[hospital_number].value) {
                // console.log("found needed schedule", details.schedules[i]);
                for (var j = 0; j < details.schedules[i].slots.length; j++) {
                    // console.log("comparing :" ,slot_start_time , details.schedules[i].slots[j].start_time);
                    if (+details.schedules[i].slots[j].start_time == +slot_start_time) {
                        // console.log("found needed slot", details.schedules[i].slots[j]);
                        slot_details = details.schedules[i].slots[j];
                        slot_details.schedule_id = details.schedules[i]._id;
                    }
                }
            }
        }
        // console.log("slot_details:", slot_details);
        // console.log("doctor_details are:", doctor_details);

        Users.findById(doctor_object_id).select('name').exec().then(name => {
            doctor_details.name = name.name;
            console.log('name is:', doctor_details.name);
            res.render("book_appointment", {
                loggedinstatus,
                message:message,
                user: req.session.user,
                slot_details,
                date_today,
                doctor_details,
                hospital_number
            });
        }).catch(err =>{
            console.log(err);
        });

    }).catch(err =>{
        console.log(err);
    });
}

var booking_status = (req,res) =>{
    if(req.session.user){
        var loggedinstatus = true;
    }
    else{
        var loggedinstatus = false;
    }
    if(req.session.message && req.session.message!=""){
        var message = req.session.message;
    }
    else{
        var message = "";
    }
    delete req.session.message;
    req.session.booking_details.patient_number = parseInt(req.session.booking_details.patient_number);
    req.session.booking_details.booking_date = new Date(req.session.booking_details.booking_date);
    req.session.booking_details.start_time = new Date(req.session.booking_details.start_time);
    req.session.booking_details.end_time = new Date(req.session.booking_details.end_time);
    var obj = req.session.booking_details;

    var schedule_id = obj.schedule_id;

    Schedules.findById(schedule_id).exec().then(details =>{
        obj.hospital_name = details.hospital;
        req.session.booking_details.hospital_name = details.hospital;
        var appointment_status = false;
        message = "Booking Failed";
        for(var i = 0 ; i < details.slots.length ; i++){
            if(details.slots[i]._id == obj.slot_id){
                for(var j = 0 ; j < details.slots[i].booked_for.length ; j++){
                    if(+details.slots[i].booked_for[j] == +obj.booking_date){
                        appointment_status = true;
                        console.log("confirmed slot booking");
                        message = "Booking Confirmed";
                    }
                }
            }
        }
        Doctor_details.findById(obj.doctor_id).exec().then(doctor_details =>{
            obj.doctor_details = doctor_details;
            req.session.booking_details.doctor_details = doctor_details;
            console.log("availed doctor_details except name");
            Users.findById(obj.doctor_id).select('name').exec().then(name =>{
                obj.doctor_details.name = name.name;
                req.session.booking_details.doctor_name = name.name;
                console.log("availed doctor's name as well");
                console.log("obj being sent is:",obj);
                res.render("booking_status",{
                    loggedinstatus,
                    message,
                    user:req.session.user,
                    obj,
                    appointment_status
                });
            }).catch(err =>{
                console.log(err);
            });
        }).catch(err =>{
            console.log(err);
        });
        
    }).catch(err =>{
        console.log(err);
    })

}

var temp = (req,res) =>{
    res.render("temp");
}

var reschedule_last_booking = (req, res) => {
    if (req.session.message && req.session.message != "") {
        var message = req.session.message;
    }
    else {
        var message = "";
    }
    delete req.session.message;
    if(req.session.user){
        var loggedinstatus = true;
    }
    else{
        var loggedinstatus = false;
    }
    var date_today = new Date();
    var day_today = date_today.getDay();
    function days(n) {
        var days_list = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        if (n > 6) {
            n = n - 7;
        }
        return days_list[n];
    }
    var obj = {};
    obj.doctor_name = req.session.booking_details.doctor_name;
    obj.booking_date = new Date(req.session.booking_details.booking_date);
    obj.hospital_name = req.session.booking_details.hospital_name;
    obj.start_time = new Date(req.session.booking_details.start_time);
    obj.end_time = new Date(req.session.booking_details.end_time);
    obj.doctor_id = req.session.booking_details.doctor_id;
    obj.doctor_details = req.session.booking_details.doctor_details;
    obj.appointment_id = req.session.booking_details.appointment_id;
    obj.slot_numbers =[0,0,0,0,0,0,0];
    Doctor_details.findById(req.session.booking_details.doctor_id).select('schedules').populate('schedules').exec().then(details => {
        for (var j = 0; j < 7; j++) {
            for (var k = 0; k < details.schedules.length; k++) {
                if (details.schedules[k].is_active == true) {
                    if (details.schedules[k].day == days(day_today + j)) {
                        var query_day = new Date();
                        query_day.setHours(0);
                        query_day.setMinutes(0);
                        query_day.setSeconds(0);
                        query_day.setMilliseconds(0);
                        query_day.setDate(query_day.getDate() + j);
                        for (var l = 0; l < details.schedules[k].slots.length; l++) {
                            if (j == 0) {

                                if (details.schedules[k].slots[l].is_active == true && details.schedules[k].slots[l].is_occupied == false && details.schedules[k].slots[l].start_time.getHours() > date_today.getHours()) {

                                    var includes = false;
                                    if (details.schedules[k].slots[l].booked_for) {
                                        for (var m = 0; m < details.schedules[k].slots[l].booked_for.length; m++) {
                                            if (+details.schedules[k].slots[l].booked_for[m] == +query_day) {
                                                includes = true;
                                            }
                                        }
                                    }
                                    if (includes == false) {
                                        obj.slot_numbers[j]++;
                                    }
                                }
                            }
                            else {
                                if (details.schedules[k].slots[l].is_active == true && details.schedules[k].slots[l].is_occupied == false) {
                                    var includes = false;
                                    if (details.schedules[k].slots[l].booked_for) {
                                        for (var m = 0; m < details.schedules[k].slots[l].booked_for.length; m++) {
                                            if (+details.schedules[k].slots[l].booked_for[m] == +query_day) {
                                                includes = true;
                                            }
                                        }
                                    }
                                    if (includes == false) {
                                        obj.slot_numbers[j]++;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        console.log("obj for reschedule includes:",obj);
        delete req.session.booking_details;
        delete req.session.booking_made;
        res.render("reschedule_appointment",{
            message,
            loggedinstatus,
            user:req.session.user,
            obj
        });
    }).catch(err =>{
        console.log(err);
    });
}

var all_appointments = (req, res) => {
    if (req.session.message && req.session.message != "") {
        var message = req.session.message;
    }
    else {
        var message = "";
    }
    delete req.session.message;
    if (req.session.user) {
        var loggedinstatus = true;
    }
    else {
        var loggedinstatus = false;
    }
    var date_now = new Date();
    var hours = date_now.getHours();
    var minutes = date_now.getMinutes();
    date_now.setHours(0, 0, 0, 0);
    var time_now = new Date(0);
    time_now.setHours(hours, minutes, 0, 0);
    var upcoming = [];
    var completed = [];
    Users.findById(req.session.user._id).select('appointments').populate('appointments').exec().then(async user => {
        console.log("found the user in session");
        console.log("number of appointments are:", user.appointments.length);
        for (var i = 0; i < user.appointments.length; i++) {
            await Users.findById(user.appointments[i].doctor_id).select('name').exec().then(async name => {
                console.log("found user doctor for name");
                user.appointments[i].doctor_name = name.name;
                await Schedules.findById(user.appointments[i].schedule_id).select('hospital').exec().then(schedule => {
                    user.appointments[i].hospital = schedule.hospital;
                    console.log("will compare dates now ", user.appointments[i].booking_date, date_now);
                    if (user.appointments[i].booking_date > date_now) {
                        console.log("booking date is bigger,pushing to upcoming");
                        upcoming.push(user.appointments[i]);
                    }
                    else if (user.appointments[i].booking_date < date_now) {
                        console.log("booking date is smaller,pushing to completed");
                        completed.push(user.appointments[i]);
                    }
                    else if (+user.appointments[i].booking_date == +date_now) {
                        console.log("booking date is that of today,will compare time now");
                        if (user.appointments[i].start_time > time_now) {
                            console.log("time is greater,pushing to upcoming");
                            upcoming.push(user.appointments[i]);
                        }
                        else if (user.appointments[i].start_time < time_now) {
                            console.log("time is smaller,pushing to completed");
                            completed.push(user.appointments[i]);
                        }
                        else if (+user.appointments[i].start_time == +time_now) {
                            console.log("time is equal,pushing to completed");
                            completed.push(user.appointments[i]);
                        }
                    }
                }).catch(err => {
                    console.log(err);
                });
            }).catch(err => {
                console.log(err);
            });


        }
        console.log("upcoming:", upcoming);
        console.log("completed:", completed);
        res.render("all_appointments", {
            message,
            loggedinstatus,
            completed,
            upcoming,
            user: req.session.user
        })
    }).catch(err => {
        console.log(err);
    });
}

var reschedule_appointment = (req,res) =>{
    if (req.session.message && req.session.message != "") {
        var message = req.session.message;
    }
    else {
        var message = "";
    }
    delete req.session.message;
    if(req.session.user){
        var loggedinstatus = true;
    }
    else{
        var loggedinstatus = false;
    }
    var date_today = new Date();
    var day_today = date_today.getDay();
    function days(n) {
        var days_list = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        if (n > 6) {
            n = n - 7;
        }
        return days_list[n];
    }
    var appointment_id = req.body.appointment_id;
    
    

    Appointments.findById(appointment_id).exec().then(appointment_details =>{
        var obj = appointment_details;
        obj.appointment_id = obj._id;
        console.log("found the needed appointment details,added the same to obj");
        //adding doctor_name to obj
        Users.findById(obj.doctor_id).select('name').exec().then(user_details =>{
            obj.doctor_name = user_details.name;
            console.log("found doctor user and added name to obj");
            //adding hospital_name to obj
            Schedules.findById(obj.schedule_id).select('hospital').exec().then(schedule_details =>{
                obj.hospital_name = schedule_details.hospital;
                console.log("found the schedule and added hospital_name to obj");
                Doctor_details.findById(obj.doctor_id).exec().then(doctor_details =>{
                    obj.doctor_details = doctor_details;
                    console.log("found doctor and added the details to obj");
                    obj.slot_numbers = [0,0,0,0,0,0,0];
                    //adding slot_numbers to obj
                    Doctor_details.findById(obj.doctor_id).select('schedules').populate('schedules').exec().then(details => {
                        for (var j = 0; j < 7; j++) {
                            for (var k = 0; k < details.schedules.length; k++) {
                                if (details.schedules[k].is_active == true) {
                                    if (details.schedules[k].day == days(day_today + j)) {
                                        var query_day = new Date();
                                        query_day.setHours(0);
                                        query_day.setMinutes(0);
                                        query_day.setSeconds(0);
                                        query_day.setMilliseconds(0);
                                        query_day.setDate(query_day.getDate() + j);
                                        for (var l = 0; l < details.schedules[k].slots.length; l++) {
                                            if (j == 0) {
                
                                                if (details.schedules[k].slots[l].is_active == true && details.schedules[k].slots[l].is_occupied == false && details.schedules[k].slots[l].start_time.getHours() > date_today.getHours()) {
                
                                                    var includes = false;
                                                    if (details.schedules[k].slots[l].booked_for) {
                                                        for (var m = 0; m < details.schedules[k].slots[l].booked_for.length; m++) {
                                                            if (+details.schedules[k].slots[l].booked_for[m] == +query_day) {
                                                                includes = true;
                                                            }
                                                        }
                                                    }
                                                    if (includes == false) {
                                                        obj.slot_numbers[j]++;
                                                    }
                                                }
                                            }
                                            else {
                                                if (details.schedules[k].slots[l].is_active == true && details.schedules[k].slots[l].is_occupied == false) {
                                                    var includes = false;
                                                    if (details.schedules[k].slots[l].booked_for) {
                                                        for (var m = 0; m < details.schedules[k].slots[l].booked_for.length; m++) {
                                                            if (+details.schedules[k].slots[l].booked_for[m] == +query_day) {
                                                                includes = true;
                                                            }
                                                        }
                                                    }
                                                    if (includes == false) {
                                                        obj.slot_numbers[j]++;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        console.log("obj for reschedule includes:",obj);
                        delete req.session.booking_details;
                        delete req.session.booking_made;
                        res.render("reschedule_appointment",{
                            message,
                            loggedinstatus,
                            user:req.session.user,
                            obj
                        });
                    }).catch(err =>{
                        console.log(err);
                    });

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
}

var change_password_settings = (req,res) =>{
    if (req.session.message && req.session.message != "") {
        var message = req.session.message;
    }
    else {
        var message = "";
    }
    delete req.session.message;
    if(req.session.user){
        var loggedinstatus = true;
    }
    else{
        var loggedinstatus = false;
    }
    res.render("change_password_settings",{
        message,
        loggedinstatus,
        user:req.session.user
    });
}



module.exports = {
    index: index,
    doctor: doctor,
    otp_login_number: otp_login_number,
    otp_login_otp: otp_login_otp,
    hospital: hospital,
    signup: signup,
    contactus: contactus,
    dentistry: dentistry,
    appointment: appointment,
    aboutus: aboutus,
    doctor_profile: doctor_profile,
    faq: faq,
    hospital_profile: hospital_profile,
    submit_query: submit_query,
    plus: plus,
    email_login: email_login,
    logout: logout,
    forgot_password_email: forgot_password_email,
    forgot_password_otp: forgot_password_otp,
    update_password: update_password,
    doctor_details_form: doctor_details_form,
    user_profile_edit: user_profile_edit,
    doctor_profile_edit: doctor_profile_edit,
    doctor_create_schedule: doctor_create_schedule,
    medical_records: medical_records,
    medical_record_display: medical_record_display,
    book_appointment: book_appointment,
    booking_status:booking_status,
    temp:temp,
    reschedule_last_booking:reschedule_last_booking,
    all_appointments:all_appointments,
    reschedule_appointment:reschedule_appointment,
    change_password_settings:change_password_settings,
};