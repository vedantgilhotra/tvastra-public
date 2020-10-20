var message = document.getElementById("message");
var close_button = document.querySelector(".small_icon");
console.log("The element found was",message);
if(message){
    close_button.addEventListener('click',disappear);
    myMove();
    setTimeout(disappear,3000);
}

function myMove() {
    var elem = document.getElementById("message");
    var pos = -288;
    var op=0;
    var id = setInterval(frame, 1);
    function frame() {
      if (pos == 0) {
        clearInterval(id);
      } 
      else {
        pos+=2;
        op+= 0.007;
        elem.style.right = pos + 'px';
        elem.style.opacity = op;
      }
    }
  }

  function disappear(){
    var elem = document.getElementById("message");
    elem.style.display = "none";
  }

  