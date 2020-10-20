var hospital = document.getElementById("hospitals");
var achievement = document.getElementById("achievements");
var qualification = document.getElementById("qualifications");
var award = document.getElementById("awards");
var specialization = document.getElementById("specializations");
var treatment = document.getElementById("treatments");


var achievements = new Tagify(achievement);
var hospitals = new Tagify(hospital);
var qualifications = new Tagify(qualification);
var awards = new Tagify(award);
var specializations = new Tagify(specialization);
if(treatment){
    var treatments = new Tagify(treatment);
}

