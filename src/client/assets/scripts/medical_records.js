var modal_close = document.querySelector(".modal_close");
var pictures_input = document.getElementById("pictures_input");
var record_type = document.querySelectorAll(".record_type");
var report_type = document.querySelector(".report");
var prescription_type = document.querySelector(".prescription");
var invoice_type = document.querySelector(".invoice");
var submit_button = document.getElementById("submit_button");
var delete_buttons = document.querySelectorAll(".delete_record");
var main_form = document.querySelector(".main_form");

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();
 if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 

today = yyyy+'-'+mm+'-'+dd;
document.getElementById("date").setAttribute("max", today);

modal_close.addEventListener('click',modal_close_function);

submit_button.addEventListener('click',check_report_type_availability,false);
submit_button.addEventListener('click',check_files_input,false);

function check_report_type_availability(e){
    if(document.getElementById("record_type").value==""){
        e.preventDefault();
        document.querySelector(".type_div_container").style.border = "solid 2px red";
    }
}

function check_files_input(e){
    if(document.getElementById('pictures_input').files.length == 0){
        alert("No files have been added for upload");
        e.preventDefault();
    }
}


function modal_close_function(){
    document.querySelector(".modal").style.display = "none";
    document.querySelector("#record_type").value ="";
    console.log(document.querySelector("#record_type").value);
    for(div of record_type){
        div.classList.remove("selected_record");
    }
    console.log(main_form);
    var thumbnails = document.querySelectorAll(".thumbnail");
    for(image of thumbnails){
        image.remove();
    }
    main_form.reset();
}

function modal_open(){
    document.querySelector(".modal").style.display = "flex";    
}

pictures_input.addEventListener('change',function(){
    if(pictures_input.files.length > 6){
        alert("cannot add more than 6 files at a time");
        submit_button.disabled = true;
        submit_button.classList.add("disabled");
        var thumbnails = document.querySelectorAll(".thumbnail");
        for(thumb of thumbnails){
            thumb.remove();
        }
        for(picture of pictures_input.files){
            var newsrc = URL.createObjectURL(picture).toString();
            var thumbnail = document.createElement('img');
            thumbnail.classList.add('thumbnail');
            thumbnail.setAttribute('src',newsrc);
            var parent = document.querySelector(".pictures_container");
            parent.appendChild(thumbnail);
        }
    }
    else{
        if(submit_button.disabled == true){
            submit_button.disabled = false;
            submit_button.classList.remove('disabled');
        }
        var thumbnails = document.querySelectorAll(".thumbnail");
        for(thumb of thumbnails){
            thumb.remove();
        }
        for(picture of pictures_input.files){
            var newsrc = URL.createObjectURL(picture).toString();
            var thumbnail = document.createElement('img');
            thumbnail.classList.add('thumbnail');
            thumbnail.setAttribute('src',newsrc);
            var parent = document.querySelector(".pictures_container");
            parent.appendChild(thumbnail);
        }
    }
    
});

report_type.addEventListener('click',function(){
    for(div of record_type){
        div.classList.remove("selected_record");
    }
    report_type.classList.add("selected_record");
    document.querySelector("#record_type").value ="report";
    console.log(document.getElementById("record_type").value);
});

prescription_type.addEventListener('click',function(){
    for(div of record_type){
        div.classList.remove("selected_record");
    }
    prescription_type.classList.add("selected_record");
    document.querySelector("#record_type").value ="prescription";
    console.log(document.getElementById("record_type").value);
});

invoice_type.addEventListener('click',function(){
    for(div of record_type){
        div.classList.remove("selected_record");
    }
    invoice_type.classList.add("selected_record");
    document.querySelector("#record_type").value ="invoice";
    console.log(document.getElementById("record_type").value);
});

for(button of delete_buttons){
    button.addEventListener('click',confirm_and_delete,false);
}

function confirm_and_delete(e){
    var confirmation = confirm("Are you sure you want to delete this record ?");
    console.log(confirmation);
    if(!confirmation){
        e.preventDefault();
    }
}