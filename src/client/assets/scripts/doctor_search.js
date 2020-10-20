var location_input = document.getElementById("location_search");
var locations_supported =["Delhi, India","New Delhi, Delhi, India"];

const doctors = ["Rose Moon","Swami Narayan","Blake Lively","Sardar Singh"];
const hospitals =["Apollo Hospital","Northstar Hospital","AIIMS"];
const treatments = ["Multi Organ Transplant","Orthopedic Surgery","Infertility treatment"];


var max_list = Math.max(doctors.length,hospitals.length,treatments.length);

var search_input = document.getElementById("doctor_search");
var list = document.getElementById("list_options");
var count_flag_options = 0;
search_input.addEventListener('keyup',()=>{
    for(var i = 0 ; i < max_list ; i++){
        
        if(doctors[i] && doctors[i].toLowerCase().indexOf(search_input.value.toLowerCase()) != -1){
            if(count_flag_options==0){
                count_flag_options++;
            }
            else if(count_flag_options==1){
                while (list.firstChild) {
                    list.removeChild(list.lastChild);
                  }
            }
            doctors.forEach(function(item){
                var option = document.createElement('option');
                option.value = item;
                list.appendChild(option);
             });
             break;
        }
        else if(hospitals[i] && hospitals[i].toLowerCase().indexOf(search_input.value.toLowerCase()) != -1){
            if(count_flag_options==0){
                count_flag_options++;
            }
            else if(count_flag_options==1){
                while (list.firstChild) {
                    list.removeChild(list.lastChild);
                  }
            }
            hospitals.forEach(function(item){
                var option = document.createElement('option');
                option.value = item;
                list.appendChild(option);
             });
             break;
        }
        else if(treatments[i] && treatments[i].toLowerCase().indexOf(search_input.value.toLowerCase()) != -1){
            if(count_flag_options==0){
                count_flag_options++;
            }
            else if(count_flag_options==1){
                while (list.firstChild) {
                    list.removeChild(list.lastChild);
                  }
            }
            treatments.forEach(function(item){
                var option = document.createElement('option');
                option.value = item;
                list.appendChild(option);
             });
             break;
        }
        // else{
        //    document.getElementById("error_doctor_search").innerHTML = "Data Not Found";
        // }
    }
    
});
var form = document.querySelector("form");
form.addEventListener('submit',submit_verification);

function submit_verification(e) {

    if (location_input.value == "") {
        alert("Enter location first");
        e.preventDefault();
        return;
    }
    if (!locations_supported.includes(location_input.value)) {
        alert("Location not supported yet");
        e.preventDefault();
        return;
    }

}