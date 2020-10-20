var someone_else = document.getElementById("appointment_for_else");
var self = document.getElementById("appointment_for_self");
var name_input = document.getElementById('name');
var patient_number = document.getElementById("patient_number");
var email = document.getElementById("email");
var default_name = name.value;
var default_patient_number = patient_number.value;
var default_email = email.value;
console.log(name_input);

someone_else.addEventListener('change',toggle_form_details);
self.addEventListener('change',toggle_form_details);

function toggle_form_details(e){
    var state = someone_else.checked;
    console.log(state);
    if(state == true){
        name_input.value = "";
        console.log(name.value);
        name_input.readOnly = false;
        patient_number.value ="";
        patient_number.readOnly = false;
        email.value = "";
        email.readOnly = false;
    }
    if(state==false){
        document.getElementById("patient_details").reset();
        name_input.readOnly = true;
        patient_number.readOnly = true;
        email.readOnly = true;
    }
}