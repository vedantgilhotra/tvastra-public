var filter_close = document.querySelectorAll(".filter_close");
var selected_filter_display_span = document.querySelectorAll(".selected_filter_display_span");
var filters = document.querySelectorAll(".filter");
var day_selector_mobile = document.querySelectorAll(".day_selector_mobile");
var day_selector = document.querySelectorAll(".day_selector");
var book_appointment = document.querySelectorAll(".book_appointment");
var book_appointment_tl = document.querySelectorAll(".book_appointment_tl");
var mobile_next = document.querySelectorAll(".scroll_forward_mobile");
var _next = document.querySelectorAll(".scroll_forward");
var mobile_prev = document.querySelectorAll(".scroll_back_mobile");
var _prev = document.querySelectorAll(".scroll_back");
var slots_available_mobile = document.querySelectorAll(".slots_available_mobile");
var slots_available = document.querySelectorAll(".slots_available");
var slot_selector_mobile = document.querySelectorAll(".slot_selector_mobile");
var slot_selector = document.querySelectorAll(".slot_selector");

var doctor_id = [];
for(var i = 0 ; i < 5 ; i++){
    var i_string = i.toString();
    var id = "doctor_list_mobile_"+i_string;
    if(document.getElementById(id)){
        doctor_id[i] = document.getElementById(id).innerHTML;
    }
}


for(slots of slot_selector_mobile){
    slots.style.display = "none";
}

for (slots of slot_selector){
    slots.style.display = "none";
}

for(slots_heading of slots_available_mobile){
    slots_heading.addEventListener('click',toggle_slot_selector_mobile);
}

for(slots_heading of slots_available){
    slots_heading.addEventListener('click',toggle_slot_selector);
}



function toggle_slot_selector_mobile(e){
    var id_selected = e.target.id;
    for(element of slots_available_mobile){
        element.classList.remove('active_slots_available_mobile');
    }
    document.getElementById(id_selected).classList.add('active_slots_available_mobile');
    var doctor_number = parseInt(e.target.id.split("_")[3]);
    var day_number = parseInt(e.target.id.split("_")[4]);
    var doctor_number_string = doctor_number.toString();
    var day_number_string = day_number.toString();

    for(var j = 0 ; j < 7 ; j++){
        var temp = j.toString();
        var slot_selector_mobile_id = "slot_selector_mobile_"+doctor_number_string+"_"+temp;
        document.getElementById(slot_selector_mobile_id).style.display = "none";
    }

    var slots = document.querySelectorAll(".slot_mobile");
    if(slots.length > 0){
        for(element of slots){
            element.remove();
        }
    }

    var id_to_display = "slot_selector_mobile_"+doctor_number_string+"_"+day_number_string;
    var xhttp = new XMLHttpRequest();
    var url = "/get_doctor_available_slots?id="+doctor_id[doctor_number]+"&day="+day_number_string;
    xhttp.open("GET",url);
    xhttp.send();

    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            //performing actions of adding slots here
            console.clear();
            console.log(xhttp.responseText);
            var morning_div_id = "morning_slots_mobile_"+doctor_number_string+"_"+day_number_string;
            console.log(morning_div_id);
            console.log("morning:",document.getElementById(morning_div_id));
            var noon_div_id = "noon_slots_mobile_"+doctor_number_string+"_"+day_number_string;
            console.log("noon:",document.getElementById(noon_div_id));
            var evevning_div_id = "evening_slots_mobile_"+doctor_number_string+"_"+day_number_string;
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
                    var class_name = "hospital_"+i_string+"_mobile";
                    slot_element.classList.add(class_name);
                    slot_element.classList.add("slot_mobile");
                    var slot_id = "slot_mobile_"+doctor_number_string+"_"+i_string;
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
            var slots_mobile = document.querySelectorAll(".slot_mobile");
            for(slot of slots_mobile){
                slot.addEventListener('click',slot_booking_mobile);
            }
        }
    }
    

}

function toggle_slot_selector(e){
    var id_selected = e.target.id;
    for(element of slots_available){
        element.classList.remove('active_slots_available');
    }
    document.getElementById(id_selected).classList.add('active_slots_available');
    var doctor_number = parseInt(e.target.id.split("_")[2]);
    var day_number = parseInt(e.target.id.split("_")[3]);
    var doctor_number_string = doctor_number.toString();
    var day_number_string = day_number.toString();

    for(var j = 0 ; j < 7 ; j++){
        var temp = j.toString();
        var slot_selector_id = "slot_selector_"+doctor_number_string+"_"+temp;
        document.getElementById(slot_selector_id).style.display = "none";
    }

    var slots = document.querySelectorAll(".slot");
    if(slots.length > 0){
        for(element of slots){
            element.remove();
        }
    }

    var id_to_display = "slot_selector_"+doctor_number_string+"_"+day_number_string;
    var xhttp = new XMLHttpRequest();
    var url = "/get_doctor_available_slots?id="+doctor_id[doctor_number]+"&day="+day_number_string;
    xhttp.open("GET",url);
    xhttp.send();

    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            //performing actions of adding slots here
            console.clear();
            console.log(xhttp.responseText);
            var morning_div_id = "morning_slots_"+doctor_number_string+"_"+day_number_string;
            console.log("morning:",document.getElementById(morning_div_id));
            var noon_div_id = "noon_slots_"+doctor_number_string+"_"+day_number_string;
            console.log("noon:",document.getElementById(noon_div_id));
            var evevning_div_id = "evening_slots_"+doctor_number_string+"_"+day_number_string;
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
                    var slot_id = "slot_"+doctor_number_string+"_"+i_string;
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
                slot.addEventListener('click',slot_booking);
            }
        }
    }
    

}

for(selector of day_selector_mobile){
    selector.style.display = "none";
}

for(selector of day_selector){
    selector.style.display = "none";
}

for(button of book_appointment){
    button.addEventListener('click',toggle_day_selector);
}

for (button of book_appointment_tl){
    button.addEventListener('click',toggle_day_selector_tl);
}

function toggle_day_selector(e){
    var button_id = (e.target.id.split("appointment_")[1]);
    console.log("button number",button_id);
    var slots_container_id = "day_selector_mobile_"+button_id;
    if(document.getElementById(slots_container_id).style.display == "none"){
        document.getElementById(slots_container_id).style.display = 'grid';
    }
    else if(document.getElementById(slots_container_id).style.display == "grid"){
        document.getElementById(slots_container_id).style.display = "none";
        for(var j = 0 ; j < 7 ; j++){
            var temp = j.toString();
            var slot_selector_mobile_id = "slot_selector_mobile_"+button_id+"_"+temp;
            document.getElementById(slot_selector_mobile_id).style.display = "none";
        }
    }
}

function toggle_day_selector_tl(e){
    var button_id = (e.target.id.split("tl_")[1]);
    console.log("button number",button_id);
    var slots_container_id = "day_selector_"+button_id;
    if(document.getElementById(slots_container_id).style.display == "none"){
        document.getElementById(slots_container_id).style.display = 'grid';
    }
    else if(document.getElementById(slots_container_id).style.display == "grid"){
        document.getElementById(slots_container_id).style.display = "none";
        for(var j = 0 ; j < 7 ; j++){
            var temp = j.toString();
            var slot_selector_id = "slot_selector_"+button_id+"_"+temp;
            document.getElementById(slot_selector_id).style.display = "none";
        }
    }
}

for(next of mobile_next){
    next.addEventListener("click",showday);
}

for(next of _next){
    next.addEventListener('click',showday_tl);
}

for(prev of mobile_prev){
    prev.addEventListener("click",showday);
}

for(prev of _prev){
    prev.addEventListener('click',showday_tl);
}

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
    var doctor_number = parseInt(e.target.id.split("_")[3]);
    // console.log(e.target.id);
    console.log("doctor_number",doctor_number);
    var skip_active = parseInt(doctor_number * 3);
    // console.log("skip_active:",skip_active);
    var active_days = document.querySelectorAll(".active_day_mobile");
    console.log(active_days);
    // console.log("last active",active_days[skip_active+2]);
    var last_active_id = parseInt(active_days[(skip_active-1)+3].id.split("_")[3]);
    var doctor_number_string = doctor_number.toString();
    if(n==1){
        if(last_active_id-2 != 4){
            var id_to_remove = (last_active_id-2).toString();
            var id_to_add = (last_active_id+1).toString();
            id_to_add = "mobile_day_"+doctor_number_string+"_"+id_to_add;
            id_to_remove = "mobile_day_"+doctor_number_string+"_"+id_to_remove;
            document.getElementById(id_to_remove).classList.remove("active_day_mobile");
            document.getElementById(id_to_add).classList.add("active_day_mobile");
        }
    }
    if(n== -1){
        if(last_active_id != 2){
            var id_to_remove = (last_active_id).toString();
            id_to_remove = "mobile_day_"+doctor_number_string+"_"+id_to_remove;
            var id_to_add = (last_active_id-3).toString();
            id_to_add = "mobile_day_"+doctor_number_string+"_"+id_to_add;
            document.getElementById(id_to_add).classList.add("active_day_mobile");
            document.getElementById(id_to_remove).classList.remove("active_day_mobile");
        }
    }
}

function showday_tl(e){
    console.log("element:",e.target);
    var next_prev = e.target.id.split("_")[1];
    console.log("next_prev:",next_prev);
    if(next_prev == 'back'){
        var n = -1;
    }
    else if(next_prev == 'forward'){
        var n = 1;
    }
    var doctor_number = parseInt(e.target.id.split("_")[2]);
    // console.log(e.target.id);
    console.log("doctor_number",doctor_number);
    var skip_active = parseInt(doctor_number * 3);
    // console.log("skip_active:",skip_active);
    var active_days = document.querySelectorAll(".active_day");
    console.log(active_days);
    console.log("last active",active_days[skip_active+2]);
    var last_active_id = parseInt(active_days[(skip_active-1)+3].id.split("_")[2]);
    var doctor_number_string = doctor_number.toString();
    if(n==1){
        if(last_active_id-2 != 4){
            var id_to_remove = (last_active_id-2).toString();
            var id_to_add = (last_active_id+1).toString();
            id_to_add = "day_"+doctor_number_string+"_"+id_to_add;
            id_to_remove = "day_"+doctor_number_string+"_"+id_to_remove;
            document.getElementById(id_to_remove).classList.remove("active_day");
            document.getElementById(id_to_add).classList.add("active_day");
        }
    }
    if(n== -1){
        if(last_active_id != 2){
            var id_to_remove = (last_active_id).toString();
            id_to_remove = "day_"+doctor_number_string+"_"+id_to_remove;
            var id_to_add = (last_active_id-3).toString();
            id_to_add = "day_"+doctor_number_string+"_"+id_to_add;
            document.getElementById(id_to_add).classList.add("active_day");
            document.getElementById(id_to_remove).classList.remove("active_day");
        }
    }
}



for (filter of filter_close){
    filter.addEventListener("click",unselect_filter);
}

function unselect_filter(e){
    var unselect_value = e.target.id.toString().split("_")[0];
    console.log(e.target);
    console.log("unselect value is ",unselect_value);
    var filter_id = e.target.id.toString().split("_")[1];
    console.log(filter_id);
    add_id = "selected_filter_"+filter_id;
    console.log(add_id);
    document.getElementById(add_id).style.display = "none";
    for(filter of filters){
        if(filter.value == unselect_value){
            filter.click();
        }
    }
}

var location_filters = document.querySelectorAll(".location_filter");
var treatment_filters = document.querySelectorAll(".treatment_filter");
var hospital_filters = document.querySelectorAll(".hospital_filter");
var experience_filters = document.querySelectorAll(".experience_filter");

for(filter of location_filters){
    filter.addEventListener("change",location_filter_change);
}

for(filter of treatment_filters){
    filter.addEventListener("change",treatment_filter_change);
}

for(filter of hospital_filters){
    filter.addEventListener("change",hospital_filter_change);
}

for(filter of experience_filters){
    filter.addEventListener("change",experience_filter_change);
}

function location_filter_change(e){
    var value = e.target.value.toString();
    console.log(value);
    var xhttp = new XMLHttpRequest();
    if(e.target.checked == true){
        var url = "location_filter_change_add?value="+value;
        console.log(url);
        xhttp.open("GET",url);
        xhttp.send();

        xhttp.onreadystatechange = function(){
            if(this.status==200 && this.readyState == 4){
                if(xhttp.responseText == "added"){
                    location.reload();
                }
            }
        }
    }
    else if(e.target.checked == false){
        var url = "location_filter_change_remove?value="+value;
        console.log(url);
        xhttp.open("GET",url);
        xhttp.send();

        xhttp.onreadystatechange = function(){
            if(this.status==200 && this.readyState == 4){
                if(xhttp.responseText == "removed"){
                    location.reload();
                }
            }
        }

    }
}

function treatment_filter_change(e){
    var value = e.target.value.toString();
    console.log(value);
    var xhttp = new XMLHttpRequest();
    if(e.target.checked == true){
        var url = "treatment_filter_change_add?value="+value;
        console.log(url);
        xhttp.open("GET",url);
        xhttp.send();

        xhttp.onreadystatechange = function(){
            if(this.status==200 && this.readyState == 4){
                if(xhttp.responseText == "added"){
                    location.reload();
                }
            }
        }
    }
    else if(e.target.checked == false){
        var url = "treatment_filter_change_remove?value="+value;
        console.log(url);
        xhttp.open("GET",url);
        xhttp.send();

        xhttp.onreadystatechange = function(){
            if(this.status==200 && this.readyState == 4){
                if(xhttp.responseText == "removed"){
                    location.reload();
                }
            }
        }

    }
}

function hospital_filter_change(e){
    var value = e.target.value.toString();
    console.log(value);
    var xhttp = new XMLHttpRequest();
    if(e.target.checked == true){
        var url = "hospital_filter_change_add?value="+value;
        console.log(url);
        xhttp.open("GET",url);
        xhttp.send();

        xhttp.onreadystatechange = function(){
            if(this.status==200 && this.readyState == 4){
                if(xhttp.responseText == "added"){
                    location.reload();
                }
            }
        }
    }
    else if(e.target.checked == false){
        var url = "hospital_filter_change_remove?value="+value;
        console.log(url);
        xhttp.open("GET",url);
        xhttp.send();

        xhttp.onreadystatechange = function(){
            if(this.status==200 && this.readyState == 4){
                if(xhttp.responseText == "removed"){
                    location.reload();
                }
            }
        }

    }
}

function experience_filter_change(e){
    var value = e.target.value.toString();
    console.log(value);
    var xhttp = new XMLHttpRequest();
    if(e.target.checked == true){
        var url = "experience_filter_change_add?value="+value;
        console.log(url);
        xhttp.open("GET",url);
        xhttp.send();

        xhttp.onreadystatechange = function(){
            if(this.status==200 && this.readyState == 4){
                if(xhttp.responseText == "added"){
                    location.reload();
                }
            }
        }
    }
    else if(e.target.checked == false){
        var url = "experience_filter_change_remove?value="+value;
        console.log(url);
        xhttp.open("GET",url);
        xhttp.send();

        xhttp.onreadystatechange = function(){
            if(this.status==200 && this.readyState == 4){
                if(xhttp.responseText == "removed"){
                    location.reload();
                }
            }
        }

    }
}



function slot_booking(e){
    console.clear();
    console.log("element clicked:",e.target.id);
    var doctor_number = parseInt(e.target.id.split("_")[1]);
    console.log("doctor number:",doctor_number);
    var doctor_object_id = doctor_id[doctor_number];
    var hospital_number = parseInt(e.target.id.split("_")[2]);
    var hospital_number_string = hospital_number.toString();
    console.log("hospital number:",hospital_number);
    var day_number = parseInt(e.target.parentElement.id.split("_")[3]);
    var day_number_string = day_number.toString();
    console.log("day number:",day_number);
    var slot_start_time = e.target.innerHTML;
    console.log("start time:",slot_start_time);
    var url = "/book_appointment?id="+doctor_object_id+"&hospital_number="+hospital_number_string+"&day_number="+day_number_string+"&time="+slot_start_time;
    window.location.href = url;
}

function slot_booking_mobile(e){
    console.clear();
    console.log("element clicked:",e.target.id);
    var doctor_number = parseInt(e.target.id.split("_")[2]);
    console.log("doctor number:",doctor_number);
    var doctor_object_id = doctor_id[doctor_number];
    var hospital_number = parseInt(e.target.id.split("_")[3]);
    var hospital_number_string = hospital_number.toString();
    console.log("hospital number:",hospital_number);
    var day_number = parseInt(e.target.parentElement.id.split("_")[4]);
    var day_number_string = day_number.toString();
    console.log("day number:",day_number);
    var slot_start_time = e.target.innerHTML;
    console.log("start time:",slot_start_time);
    var url = "/book_appointment?id="+doctor_object_id+"&hospital_number="+hospital_number_string+"&day_number="+day_number_string+"&time="+slot_start_time;
    window.location.href = url;
}
