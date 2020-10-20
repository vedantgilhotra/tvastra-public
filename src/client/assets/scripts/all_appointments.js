var cancel_buttons = document.querySelectorAll(".cancel_button");

for(i of cancel_buttons){
    i.addEventListener('click',confirm_cancellation);
}

function confirm_cancellation(e){
    var confirmation = confirm("Are you sure you wish to cancel this appointment ?");
    if(!confirmation){
        e.preventDefault();
    }
}