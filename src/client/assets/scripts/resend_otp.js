
var timer = document.getElementById("resendin");
var resendlink = document.getElementById("resend");

var second = 30;

var id = setInterval(time,1000);
function time(){
    if(second==0){
        timer.style.display = "none";
        resendlink.style.display="block";
        clearInterval(id);
    }
    else{
    timer.innerHTML = "Resend OTP in "+second;
    second--;
    }
}