var options = document.querySelectorAll(".option");
var faq_chevron = document.querySelectorAll(".faq-chevron");


var first_question_info = options[0].nextElementSibling;
first_question_info.style.maxHeight = first_question_info.scrollHeight +"px";
first_question_info.style.marginTop = '1rem';


for (el of options){
    el.addEventListener('click',accordion);
}

function accordion(e){
    console.log(e.target);
    for(element of options){
        element.classList.remove('chevron_transform');
        var info = element.nextElementSibling;
        info.style.maxHeight = 0;
        info.style.marginTop = '0rem';
    }
    e.target.classList.add('chevron_transform');
    var info = e.target.nextElementSibling;
    console.log("next sibling",info);
    info.style.maxHeight = info.scrollHeight +"px";
    info.style.marginTop = '1rem';
}