var edit_number = document.getElementById("edit_number");
var new_profile_picture = document.getElementById("new_profile_picture");
console.log("profile picture element",new_profile_picture);
var profile_picture_input = document.getElementById("profile_picture_input");
console.log("profile picture input",profile_picture_input);
var changes_form = document.getElementById("changes_form");

profile_picture_input.addEventListener('change',() => {
    var newsrc = URL.createObjectURL(profile_picture_input.files[0]).toString();
    new_profile_picture.setAttribute("src",newsrc);
    changes_form.setAttribute("enctype","multipart/form-data");
})

edit_number.addEventListener('click', ()=>{
    document.getElementById("number").readOnly = false;
});


