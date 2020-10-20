var modal = document.querySelector(".modal");
modal.style.display = "none";

function modal_open(){
    modal.style.display = "flex";
}

function modal_close(){
    modal.style.display = 'none';
}

function confirm_and_cancel(){
   window.location.href = "/cancel_last_booking";
}

function trigger_reschedule_page(){
    window.location.href ="/reschedule_last_booking";
}