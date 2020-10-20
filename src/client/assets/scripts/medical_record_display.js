var modal_close = document.querySelector(".modal_close");
var pictures_input = document.getElementById("pictures_input");
var submit_button = document.getElementById("submit_button");
var main_form = document.querySelector(".main_form");
var delete_buttons = document.querySelectorAll(".delete_image");
var options = document.querySelectorAll(".options");

for(button of delete_buttons){
    button.style.display ="none";
}

modal_close.addEventListener('click',modal_close_function);

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
})

submit_button.addEventListener('click',check_files_input,false);

function check_files_input(e){
    if(document.getElementById('pictures_input').files.length == 0){
        alert("No files have been added for upload");
        e.preventDefault();
    }
}

for(option of options){
    option.addEventListener('click',toggle_delete);
}

function toggle_delete(e){
    var id = e.target.id.split("options_")[1];
    var delete_button_id = "delete_image_"+id;
    if(document.getElementById(delete_button_id).style.display == "none"){
        document.getElementById(delete_button_id).style.display = "block";
    }
    else if(document.getElementById(delete_button_id).style.display == "block"){
        document.getElementById(delete_button_id).style.display = "none";
    }
}

for (button of delete_buttons){
    button.addEventListener('click',confirm_and_delete);
}

function confirm_and_delete(e){
    var file_id = e.target.id.toString().split("image_")[1];
    var record_id = document.querySelector(".record_id").id;
    var confirmation = confirm("Are you sure you want to delete this record file ?");
    if(confirmation){
        var xhttp = new XMLHttpRequest();
        var url = "/medical_record_display_delete?file_id="+file_id+"&record_id="+record_id;
        console.log(url);
        xhttp.open("GET",url);
        xhttp.send();

        xhttp.onreadystatechange = function(){
            if(this.readyState == 4 && this.status==200){
                if(xhttp.responseText=="updated"){
                    console.log("updated");
                    location.reload();
                }
            }
        }
    }
}