var sidebar_shade = document.querySelector(".sidebar_shade");
var sidebar = document.querySelector(".sidebar");
var menu_button = document.getElementById("sidebar_toggle");
var treatments_dropdown = document.querySelector(".treatments_dropdown");
var back_button = document.getElementById("sidebar_close");
back_button.disabled = true;
var sidebar_entry = document.querySelectorAll(".sidebar_entry");
var profile_dropdown = document.querySelector(".profile_dropdown");
var dropdown_options = document.querySelector(".profile_dropdown_options");
dropdown_options.style.display ="none";

profile_dropdown.addEventListener('click',toggle_dropdown_options);

function toggle_dropdown_options(){
    if(dropdown_options.style.display =="none"){
        dropdown_options.style.display = 'flex';
    }
    else if(dropdown_options.style.display=="flex"){
        dropdown_options.style.display= "none";
    }
}

for(entry of sidebar_entry){
    entry.addEventListener('click',hide_sidebar);
}

if(treatments_dropdown){
    treatments_dropdown.style.display = "none";
}

sidebar_shade.style.display = "none";

menu_button.addEventListener('click',show_sidebar);

function show_sidebar(){
    if(sidebar_shade.style.display == "none"){
        sidebar_shade.style.display = 'block';
        var pos = -100;
        var id =setInterval(move_in,4);
        function move_in(){
            if(pos==0){
                clearInterval(id);
                back_button.disabled = false;
            }
            else{
                pos += 1;
                sidebar_shade.style.right = pos + '%';
            }
        }
    }
}

back_button.addEventListener('click',hide_sidebar);

function hide_sidebar(){
    if(sidebar_shade.style.display == 'block'){
        back_button.disabled = true;
        var pos = 0;
        var id = setInterval(move_out,4);
        function move_out(){
            if(pos == -100){
                clearInterval(id);
                sidebar_shade.style.display = 'none';
            }
            else{
                pos = pos - 1;
                pos = pos.toString();
                sidebar_shade.style.right = pos + '%';
            }
        }
    }
}

function treatments_dropdown_toggle(){
    if(treatments_dropdown.style.display == "none"){
        treatments_dropdown.style.display = 'flex';
    }
    else if(treatments_dropdown.style.display == 'flex'){
        treatments_dropdown.style.display = "none";
    }
}

var tvastra_plus = document.getElementById("tvastra_plus");
if(tvastra_plus){
tvastra_plus.parentElement.setAttribute("href","/plus");
}

var get_quote = document.querySelector(".get_quote_button");
if(get_quote){
    get_quote.addEventListener('click',function(){
        window.location.href ="/submit_query";
    });
}