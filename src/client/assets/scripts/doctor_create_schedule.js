

var view_slots_buttons = document.querySelectorAll(".view_slots");
var slots_containers = document.querySelectorAll(".slots_container");
var remove_slots_button_links_container = document.querySelectorAll(".remove_slots_button_link");

for(i of slots_containers){
    i.style.display = "none";
}


function toggle_slots(e) {
    console.log(e.target.id);
    var id_add = e.target.id.split("slot_")[1].toString();
    console.log(id_add);
    var id_add = ("slots_container_"+id_add).toString();
    console.log(id_add);
    if (document.getElementById(id_add).style.display == 'none') {
        console.log("condition triggered none");
        document.getElementById(id_add).style.display = "flex"
        e.target.innerHTML = 'Hide slots';
    }
    else if (document.getElementById(id_add).style.display == "flex") {
        console.log("condition triggered flex");
        document.getElementById(id_add).style.display = "none";
        e.target.innerHTML = 'View slots';
    }
}

function confirm_and_delete(e){
    var id_add = parseInt(e.target.id.split("link_")[1]);
    console.log("schedule number",id_add);
    var confirmation = confirm("Are you sure you want to remove this set of created slot(s) ?");
    console.log(confirmation);
    if(!confirmation){
        e.preventDefault();
    }
}

for(var i = 0; i < view_slots_buttons.length; i++) {
    view_slots_buttons[i].addEventListener("click",toggle_slots)
    remove_slots_button_links_container[i].addEventListener("click",confirm_and_delete,false);
}

var modal_close = document.querySelector(".modal_close");

modal_close.addEventListener('click',modal_close_function)

function modal_close_function(){
    document.querySelector(".modal").style.display = "none";
}
function modal_open(){
    document.querySelector(".modal").style.display = "flex";    
}

//form validation functions
var starting_time = document.getElementById("start_time");
var end_time = document.getElementById("end_time");
var interval = document.getElementById("interval");
var submit_button = document.querySelector(".schedule_submit");

function disable_button_check(x,elem){
    if(x==true){
        elem.style.color = "red";
        elem.style.border = "solid 2px red";
        elem.style.fontSize = "18px";
        elem.style.fontFamily = "TheBoldFont";
        submit_button.disabled = true;
        submit_button.style.cursor = "not-allowed";
    }
    else if(x==false){
        elem.style.color = "black";
        elem.style.border = "solid 1px black";
        elem.style.fontSize = "16px";
        elem.style.fontFamily = "TheLightFont";
        submit_button.disabled = false;
        submit_button.style.cursor = "default";
    }
}

start_time.addEventListener("clocklet.closed",()=>{
    var start_time_value = 60 * parseInt(start_time.value.split(":")[0]) + parseInt(start_time.value.split(':')[1]);
    var end_time_value = 60 * parseInt(end_time.value.split(":")[0]) + parseInt(end_time.value.split(':')[1]);
    
    disable_button_check(start_time_value >= end_time_value || start_time_value + parseInt(interval.value) > end_time_value,end_time);
    disable_button_check(start_time_value >= end_time_value || start_time_value + parseInt(interval.value) > end_time_value,start_time);
    disable_button_check(start_time_value + parseInt(interval.value) > end_time_value,interval);

}); 

end_time.addEventListener("clocklet.closed",()=>{
    var start_time_value = 60 * parseInt(start_time.value.split(":")[0]) + parseInt(start_time.value.split(':')[1]);
    var end_time_value = 60 * parseInt(end_time.value.split(":")[0]) + parseInt(end_time.value.split(':')[1]);
    
    disable_button_check(start_time_value >= end_time_value || start_time_value + parseInt(interval.value) > end_time_value,end_time);
    disable_button_check(start_time_value >= end_time_value || start_time_value + parseInt(interval.value) > end_time_value,start_time);
    disable_button_check(start_time_value + parseInt(interval.value) > end_time_value,interval);

});

interval.addEventListener("focusout",()=>{
    var start_time_value = 60 * parseInt(start_time.value.split(":")[0]) + parseInt(start_time.value.split(':')[1]);
    var end_time_value = 60 * parseInt(end_time.value.split(":")[0]) + parseInt(end_time.value.split(':')[1]);
    
    disable_button_check(start_time_value >= end_time_value || start_time_value + parseInt(interval.value) > end_time_value,end_time);
    disable_button_check(start_time_value >= end_time_value || start_time_value + parseInt(interval.value) > end_time_value,start_time);
    disable_button_check(start_time_value + parseInt(interval.value) > end_time_value,interval);
});



// ajax request for checkboxes 

var schedule_checkbox = document.querySelectorAll(".made_schedule_selection");

for (i of schedule_checkbox) {
    i.addEventListener('change', schedule_state_trigger);
}

function schedule_state_trigger(e) {
    var add_id = parseInt(e.target.id.split("selection_")[1]);
    var xhttp = new XMLHttpRequest();
    console.log(e.target.checked);
    if (e.target.checked==true) {
        const url = "/toggle_schedule_active_state?id=" + add_id;
        console.log(url);
        xhttp.open("GET", url);
        xhttp.send();

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log(xhttp.responseText);
                if (xhttp.responseText == "updated") {
                    console.log("inintial value of id", add_id);
                    add_id = add_id.toString();
                    console.log(add_id);

                    var made_schedule_id = "made_schedule_" + add_id;
                    console.log(document.getElementById(made_schedule_id));
                    document.getElementById(made_schedule_id).classList.add("made_schedule_inactive");
                }
            }
        }
    }
    else if(e.target.checked == false){
        var url = "/toggle_schedule_inactive_state?id="+add_id;
        console.log(url);
        xhttp.open("GET",url);
        xhttp.send();

        xhttp.onreadystatechange = function (){
            if(this.readyState == 4 && this.status == 200) {
                console.log(xhttp.responseText);
                if(xhttp.responseText == "updated") {
                    add_id =add_id.toString();
                    var made_schedule_id = "made_schedule_"+add_id;
                    console.log(document.getElementById(made_schedule_id));
                    document.getElementById(made_schedule_id).classList.remove("made_schedule_inactive");
                }
            }
        }
    }
}


var slots = document.querySelectorAll(".slot_selection");

for(i of slots){
    i.addEventListener('change',slot_toggle);
}

function slot_toggle(e){
    var id_split = e.target.id;
    console.log(id_split);
    id_split = id_split.split("_");
    var schedule_id = id_split[2];
    var slot_id = id_split[3];
    console.log("schedule id",schedule_id);
    console.log("slot id",slot_id);
    var add_id  = schedule_id+"_"+slot_id;
    console.log(add_id);
    var xhttp = new XMLHttpRequest();
    if(e.target.checked == true){
        var url = "/toggle_slot_inactive_state?id="+add_id;
        console.log(url);
        xhttp.open("GET", url);
        xhttp.send();

        xhttp.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200){
                console.log(xhttp.responseText);
                if(xhttp.responseText == "updated"){
                    var slot_box_id = "slot_"+add_id;
                    var slot_inactive = document.getElementById(slot_box_id);
                    slot_inactive.classList.add("slot_inactive");
                }
            }
        }
    }
    else if(e.target.checked == false){
        var url = "/toggle_slot_active_state?id="+add_id;
        console.log(url);
        xhttp.open("GET", url);
        xhttp.send();

        xhttp.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200){
                console.log(xhttp.responseText);
                if(xhttp.responseText == "updated"){
                    var slot_box_id = "slot_"+add_id;
                    var slot_inactive = document.getElementById(slot_box_id);
                    slot_inactive.classList.remove("slot_inactive");
                }
            }
        }
    }
}