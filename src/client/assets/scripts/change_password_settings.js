var new_password = document.getElementById("new_password");
var confirm_new_password = document.getElementById("confirm_new_password");
var submit_button = document.getElementById("change_password");

confirm_new_password.addEventListener('input',function(){
    var value1 = new_password.value;
    var value2 = confirm_new_password.value;
    if(value1!= value2){
        submit_button.classList.add('not_allowed');
        confirm_new_password.classList.add('wrong_match');
    }
    else if(value1==value2){
        submit_button.classList.remove('not_allowed');
        confirm_new_password.classList.remove('wrong_match');
    }
});

submit_button.addEventListener('click',form_validation);

function form_validation(e){
    var value1 = new_password.value;
    var value2 = confirm_new_password.value;
    if(value1!=value2){
        alert("New Password and Confirm Password do not match");
        e.preventDefault();
    }
}