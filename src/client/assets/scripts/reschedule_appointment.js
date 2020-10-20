var doctor_id = document.getElementById("doctor_id").innerHTML.toString();
var next = document.getElementById("scroll_forward");
var prev = document.getElementById("scroll_back");

next.addEventListener('click',showday);
prev.addEventListener('click',showday);

function showday(e){
    // console.log("element:",e.target);
    var next_prev = e.target.id.split("_")[1];
    // console.log("next_prev:",next_prev);
    if(next_prev == 'back'){
        var n = -1;
    }
    else if(next_prev == 'forward'){
        var n = 1;
    }
    // console.log(e.target.id);
    var active_days = document.querySelectorAll(".active_day");
    console.log(active_days);
    // console.log("last active",active_days[skip_active+2]);
    var last_active_id = parseInt(active_days[2].id.split("_")[1]);
    if(n==1){
        if(last_active_id-2 != 4){
            var id_to_remove = (last_active_id-2).toString();
            var id_to_add = (last_active_id+1).toString();
            id_to_add = "day_"+id_to_add;
            id_to_remove = "day_"+id_to_remove;
            document.getElementById(id_to_remove).classList.remove("active_day");
            document.getElementById(id_to_add).classList.add("active_day");
        }
    }
    if(n== -1){
        if(last_active_id != 2){
            var id_to_remove = (last_active_id).toString();
            id_to_remove = "day_"+id_to_remove;
            var id_to_add = (last_active_id-3).toString();
            id_to_add = "day_"+id_to_add;
            document.getElementById(id_to_add).classList.add("active_day");
            document.getElementById(id_to_remove).classList.remove("active_day");
        }
    }
}

var slot_selector = document.querySelectorAll(".slot_selector");
var day_selector = document.getElementById("day_selector");
day_selector.style.display ="none";

for(selector of slot_selector){
    selector.style.display = "none";
}

function toggle_day_selector(){
    if(day_selector.style.display == "none"){
        day_selector.style.display = "grid";
    }
    else if(day_selector.style.display == "grid"){
        for(selector of slot_selector){
            selector.style.display = "none";
        }
        day_selector.style.display = "none";
    }
}

var slots_available = document.querySelectorAll(".slots_available");
for(slot of slots_available){
    slot.addEventListener('click',toggle_slot_selector);
}

function toggle_slot_selector(e){
    var day_number = parseInt(e.target.id.split("_")[2]);
    var day_number_string = day_number.toString();

    for(var j = 0 ; j < 7 ; j++){
        var temp = j.toString();
        var slot_selector_id = "slot_selector_"+temp;
        document.getElementById(slot_selector_id).style.display = "none";
    }

    var id_to_display = "slot_selector_"+day_number_string;
    var xhttp = new XMLHttpRequest();
    var url = "/get_doctor_available_slots?id="+doctor_id+"&day="+day_number_string;
    xhttp.open("GET",url);
    xhttp.send();

    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            //performing actions of adding slots here
            console.clear();
            console.log(xhttp.responseText);
            var morning_div_id = "morning_slots_"+day_number_string;
            console.log(morning_div_id);
            console.log("morning:",document.getElementById(morning_div_id));
            var noon_div_id = "noon_slots_"+day_number_string;
            console.log("noon:",document.getElementById(noon_div_id));
            var evevning_div_id = "evening_slots_"+day_number_string;
            console.log("evening:",document.getElementById(evevning_div_id));
            var available_slots = JSON.parse(xhttp.responseText);
            console.log(available_slots);
            for(var i = 0 ; i < available_slots.length ; i++){
                var i_string = i.toString();
                for(var j = 0 ; j < available_slots[i].length ; j++){
                    var slot_start = new Date(available_slots[i][j]);
                    console.log("slot_start",slot_start);
                    var slot_start_time = slot_start.getTime();
                    console.log("slot_start_time:",slot_start_time);
                    var noon_start = new Date(0);
                    noon_start.setHours(12);
                    noon_start = noon_start.getTime();
                    var noon_end = new Date(0);
                    noon_end.setHours(16);
                    noon_end = noon_end.getTime();
                    var day_end = new Date(0);
                    day_end.setHours(24);
                    day_end = day_end.getTime();
                    var slot_element = document.createElement("span");
                    var class_name = "hospital_"+i_string;
                    slot_element.classList.add(class_name);
                    slot_element.classList.add("slot");
                    var slot_id = "slot_"+i_string;
                    slot_element.setAttribute("id",slot_id);
                    slot_element.innerHTML = slot_start.toLocaleTimeString();
                    console.log("element made:",slot_element);
                    if(0<=slot_start_time && noon_start > slot_start_time){
                        document.getElementById(morning_div_id).appendChild(slot_element);
                    }
                    else if(noon_start <= slot_start_time && slot_start_time < noon_end){
                        document.getElementById(noon_div_id).appendChild(slot_element);
                    }
                    else if(noon_end <= slot_start_time && slot_start_time < day_end){
                        document.getElementById(evevning_div_id).appendChild(slot_element);
                    }
                }
            }
            document.getElementById(id_to_display).style.display = 'block';
            var slots = document.querySelectorAll(".slot");
            for(slot of slots){
                slot.addEventListener('click',slot_rescheduling);
            }
        }
    }
    

}

function slot_rescheduling(e){
    var hospital_number = parseInt(e.target.id.split("_")[1]);
    var hospital_number_string = hospital_number.toString();
    var slot_start_time = e.target.innerHTML;
    var day_number = parseInt(e.target.parentElement.id.split("_")[2]);
    var day_number_string = day_number.toString();
    var appointment_id = document.getElementById("appointment_id").innerHTML;
    var url = "/confirm_reschedule_last_booking?hospital_number="+hospital_number_string+"&day_number="+day_number_string+"&time="+slot_start_time+"&appointment_id="+appointment_id;

    window.location.href = url;

}
