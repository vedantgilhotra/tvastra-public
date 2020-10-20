const dbconn = require("../databases/mongodb");
const Users = dbconn.Users;
const Doctor_details = dbconn.Doctor_details;
const Schedules = dbconn.Schedules;

var location_filter_change_add = (req,res) => {
    var value = req.query.value;
    value = value.toString();
    console.log(value);
    if(req.session.doctor_filters.user_query_part.city){
        req.session.doctor_filters.city_array.push(value);
        req.session.doctor_filters.filter_values.push(value);
        req.session.doctor_filters.user_query_part.city= {$in:req.session.doctor_filters.city_array};
        console.log(req.session.doctor_filters.user_query_part);
        req.session.new_filter = true;
        res.status(200).send("added");
    }
    else{
        req.session.doctor_filters.city_array = [];
        req.session.doctor_filters.city_array.push(value);
        req.session.doctor_filters.filter_values.push(value);
        req.session.doctor_filters.user_query_part.city = {$in:req.session.doctor_filters.city_array};
        console.log(req.session.doctor_filters.user_query_part);
        req.session.new_filter = true;
        res.status(200).send("added");
    }
}

var location_filter_change_remove = (req,res) =>{
    var value = req.query.value;
    value = value.toString();
    console.log(value);
    if(req.session.doctor_filters.user_query_part.city){
       for (var i = 0; i < req.session.doctor_filters.city_array.length;i++){
           if(req.session.doctor_filters.city_array[i]==value){
            req.session.doctor_filters.city_array.splice(i,1);
           }
       }
       for (var i = 0; i < req.session.doctor_filters.filter_values.length;i++){
        if(req.session.doctor_filters.filter_values[i]==value){
         req.session.doctor_filters.filter_values.splice(i,1);
        }
    }
       if(req.session.doctor_filters.city_array.length == 0){
           delete req.session.doctor_filters.user_query_part.city;
           console.log(req.session.doctor_filters.user_query_part);
           req.session.new_filter = true;
           res.status(200).send("removed");
       }
       else{
           req.session.doctor_filters.user_query_part.city = {$in:req.session.doctor_filters.city_array};
           console.log(req.session.doctor_filters.user_query_part);
           req.session.new_filter = true;
           res.status(200).send("removed");
        }
    }
}

var treatment_filter_change_add = (req,res) => {
    var value = req.query.value;
    value = value.toString();
    req.session.doctor_filters.filter_values.push(value);
    var ac_value = value;
    value = {};
    value.value = ac_value;
    console.log(value);
    if(req.session.doctor_filters.doctor_details_query_part.treatments){
        req.session.doctor_filters.treatments_array.push(value);
        req.session.doctor_filters.doctor_details_query_part.treatments.$elemMatch.$in= req.session.doctor_filters.treatments_array;
        console.log(req.session.doctor_filters.doctor_details_query_part);
        req.session.new_filter = true;
        res.status(200).send("added");
    }
    else{
        req.session.doctor_filters.treatments_array = [];
        req.session.doctor_filters.treatments_array.push(value);
        req.session.doctor_filters.doctor_details_query_part.treatments ={};
        req.session.doctor_filters.doctor_details_query_part.treatments.$elemMatch = {} ;
        req.session.doctor_filters.doctor_details_query_part.treatments.$elemMatch = {$in: req.session.doctor_filters.treatments_array};
        console.log(req.session.doctor_filters.doctor_details_query_part);
        req.session.new_filter = true;
        res.status(200).send("added");
    }
}

var treatment_filter_change_remove = (req,res) =>{
    var value_tbr = req.query.value;
    value_tbr = value_tbr.toString();
    console.log(value_tbr);
    if(req.session.doctor_filters.doctor_details_query_part.treatments){
       for (var i = 0; i < req.session.doctor_filters.treatments_array.length;i++){
           if(req.session.doctor_filters.treatments_array[i].value==value_tbr){
            req.session.doctor_filters.treatments_array.splice(i,1);
           }
       }
       for (var i = 0; i < req.session.doctor_filters.filter_values.length;i++){
        if(req.session.doctor_filters.filter_values[i]==value_tbr){
         req.session.doctor_filters.filter_values.splice(i,1);
        }
    }
       if(req.session.doctor_filters.treatments_array.length == 0){
           delete req.session.doctor_filters.doctor_details_query_part.treatments;
           console.log(req.session.doctor_filters.user_query_part);
           req.session.new_filter = true;
           res.status(200).send("removed");
       }
       else{
           req.session.doctor_filters.doctor_details_query_part.treatments = {$in:req.session.doctor_filters.treatments_array};
           console.log(req.session.doctor_filters.doctor_details_query_part);
           req.session.new_filter = true;
           res.status(200).send("removed");
        }
    }
}

var hospital_filter_change_add = (req,res) => {
    var value = req.query.value;
    value = value.toString();
    req.session.doctor_filters.filter_values.push(value);
    var ac_value = value;
    value = {};
    value.value = ac_value;
    console.log(value);
    if(req.session.doctor_filters.doctor_details_query_part.hospitals){
        req.session.doctor_filters.hospitals_array.push(value);
        req.session.doctor_filters.doctor_details_query_part.hospitals.$elemMatch.$in= req.session.doctor_filters.hospitals_array;
        console.log(req.session.doctor_filters.doctor_details_query_part);
        req.session.new_filter = true;
        res.status(200).send("added");
    }
    else{
        req.session.doctor_filters.hospitals_array = [];
        req.session.doctor_filters.hospitals_array.push(value);
        req.session.doctor_filters.doctor_details_query_part.hospitals ={};
        req.session.doctor_filters.doctor_details_query_part.hospitals.$elemMatch = {} ;
        req.session.doctor_filters.doctor_details_query_part.hospitals.$elemMatch = {$in: req.session.doctor_filters.hospitals_array};
        console.log(req.session.doctor_filters.doctor_details_query_part);
        req.session.new_filter = true;
        res.status(200).send("added");
    }
}

var hospital_filter_change_remove = (req,res) =>{
    var value_tbr = req.query.value;
    value_tbr = value_tbr.toString();
    console.log(value_tbr);
    if(req.session.doctor_filters.doctor_details_query_part.hospitals){
       for (var i = 0; i < req.session.doctor_filters.hospitals_array.length;i++){
           if(req.session.doctor_filters.hospitals_array[i].value==value_tbr){
            req.session.doctor_filters.hospitals_array.splice(i,1);
           }
       }
       for (var i = 0; i < req.session.doctor_filters.filter_values.length;i++){
        if(req.session.doctor_filters.filter_values[i]==value_tbr){
         req.session.doctor_filters.filter_values.splice(i,1);
        }
    }
       if(req.session.doctor_filters.hospitals_array.length == 0){
           delete req.session.doctor_filters.doctor_details_query_part.hospitals;
           console.log(req.session.doctor_filters.user_query_part);
           req.session.new_filter = true;
           res.status(200).send("removed");
       }
       else{
           req.session.doctor_filters.doctor_details_query_part.hospitals = {$in:req.session.doctor_filters.hospitals_array};
           console.log(req.session.doctor_filters.doctor_details_query_part);
           req.session.new_filter = true;
           res.status(200).send("removed");
        }
    }
}

var experience_filter_change_add = (req,res) => {
    var value = req.query.value;
    value = parseInt(value);
    console.log(value);
    if(req.session.doctor_filters.doctor_details_query_part.experience){
        req.session.doctor_filters.experience_value = 0;
        for(var n = 0; n< req.session.doctor_filters.filter_values.length ; n++){
            if(typeof(req.session.doctor_filters.filter_values[n]) == "number"){
                console.log("experience to be removed found in filter values:",req.session.doctor_filters.filter_values[n]);
                req.session.doctor_filters.filter_values.splice(n,1);
            }
        }
        req.session.doctor_filters.experience_value = value;
        req.session.doctor_filters.filter_values.push(value);
        req.session.doctor_filters.doctor_details_query_part.experience = {};
        req.session.doctor_filters.doctor_details_query_part.experience.$gte=req.session.doctor_filters.experience_value;
        console.log(req.session.doctor_filters.doctor_details_query_part);
        req.session.new_filter = true;
        res.status(200).send("added");
    }
    else{
        req.session.doctor_filters.experience_value = 0;
        req.session.doctor_filters.experience_value = value;
        req.session.doctor_filters.filter_values.push(value);
        req.session.doctor_filters.doctor_details_query_part.experience = {};
        req.session.doctor_filters.doctor_details_query_part.experience.$gte = req.session.doctor_filters.experience_value;
        console.log(req.session.doctor_filters.doctor_details_query_part);
        req.session.new_filter = true;
        res.status(200).send("added");
    }
}

var experience_filter_change_remove = (req,res) =>{
    var value = req.query.value;
    value = parseInt(value)
    console.log(value);
    if(req.session.doctor_filters.doctor_details_query_part.experience){
       req.session.doctor_filters.experience_value = 0;
       for (var i = 0; i < req.session.doctor_filters.filter_values.length;i++){
        if(typeof(req.session.doctor_filters.filter_values[i])=="number"){
            console.log("value to be removed found in filter_values:",req.session.doctor_filters.filter_values[i]);
            req.session.doctor_filters.filter_values.splice(i,1);
        }
    }
       delete req.session.doctor_filters.doctor_details_query_part.experience;
       req.session.new_filter = true;
       res.status(200).send("removed");
    }
}

var sort_doctors = (req,res) =>{
    var sort_by = req.body.sort_by;
    console.log(sort_by);
    req.session.doctor_filters.sort_by = sort_by;
    res.redirect("/doctor");
}

module.exports = {
    location_filter_change_add:location_filter_change_add,
    treatment_filter_change_add:treatment_filter_change_add,
    hospital_filter_change_add:hospital_filter_change_add,
    experience_filter_change_add:experience_filter_change_add,
    location_filter_change_remove:location_filter_change_remove,
    hospital_filter_change_remove:hospital_filter_change_remove,
    treatment_filter_change_remove:treatment_filter_change_remove,
    experience_filter_change_remove:experience_filter_change_remove,
    sort_doctors:sort_doctors
}