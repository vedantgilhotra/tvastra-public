var list_items = document.querySelectorAll(".bordered");
var mobile_images = document.querySelectorAll(".mobile_view_image_container");
var tab_laptop_image = document.getElementById("tab_laptop_view_image");
var tab_laptop_b = document.getElementById("tab_laptop_view_b");
var tab_laptop_p = document.getElementById("tab_laptop_view_p");
var dots = document.querySelectorAll(".dot");
var doctor_cards = document.querySelectorAll(".doctor_card");

var images_array = 
["https://s3.ap-south-1.amazonaws.com/appdev.konfinity.com/css/tasks/img1.png",
"https://s3.ap-south-1.amazonaws.com/appdev.konfinity.com/css/tasks/img2.png",
"https://s3.ap-south-1.amazonaws.com/appdev.konfinity.com/css/tasks/img3.jpeg",
"https://s3.ap-south-1.amazonaws.com/appdev.konfinity.com/css/tasks/img4.jpeg",
"https://s3.ap-south-1.amazonaws.com/appdev.konfinity.com/css/tasks/img5.jpg",
"https://s3.ap-south-1.amazonaws.com/appdev.konfinity.com/css/tasks/img6.jpg",
"https://s3.ap-south-1.amazonaws.com/appdev.konfinity.com/css/tasks/img7.jpeg"
]

var b_text_array = 
[
    "Fix Consultation",
    "Upload Medical Reports",
    "Consult With Doctor",
    "Fix Surgery",
    "Hospital Sent Estimates",
    "Payment",
    "Surgery Completed"
]

var p_text_array = 
[
    "This depicts that user will have to fix appointment first when it selects a particular doctor",
    "User can upload their previous Medical Reports online in case of any previous treatments issues.",
    "User can Consult with doctors online.",
    "User are provided with surgery related facilities.",
    "User can know their Hospital sent estimated cost online.",
    "Online payment portal is also provided in case of any online services.",
    "User get all their surgery related Informations."
]

for(item of list_items){
    if(item.classList.contains('selected')){
        var first_panel = item.nextElementSibling;
        first_panel.style.maxHeight = first_panel.scrollHeight +"px";
    }
    item.addEventListener('click',function(){
        for(element of list_items){
            element.classList.remove('selected');
            var disappear = element.nextElementSibling;
            disappear.style.maxHeight = null;
        }
        this.classList.add('selected');
        if(window.innerWidth < 768){
            var panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
              } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
              }
        }
        else if (window.innerWidth >= 768) {

            for (var i = 0; i < list_items.length; i++) {
                var i_string = i.toString();
                var match_class = "item_" + i_string;
                if (this.classList.contains(match_class)) {
                    tab_laptop_image.setAttribute('src', images_array[i]);
                    tab_laptop_b.innerHTML = b_text_array[i];
                    tab_laptop_p.innerHTML = p_text_array[i];
                }
            }

        }
        
    });
}

for(item of dots){
    item.addEventListener('click',function(){
        var dot_number = parseInt(this.id.split("_")[2]);
        var skip = dot_number * 4;
        for(el of dots){
            el.classList.remove('selected');
        }
        this.classList.add('selected');
        for(card of doctor_cards){
            card.classList.remove('active_doctor_card');
        }
        for(var i = skip; i < skip+4 ; i++){
            doctor_cards[i].classList.add('active_doctor_card');
        }
    })
}