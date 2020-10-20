var pages_needed = parseInt(document.getElementById("pages_needed").innerHTML);
console.log("pages needed are", pages_needed);
var current_page = parseInt(document.getElementById("current_page").innerHTML);
console.log("current page value is ", current_page);
var pagination = document.getElementById("pagination");
console.log("pagination div found is ", pagination);
var current_page_value = current_page.toString();
for (var i = 1; i <= pages_needed; i++) {
    if (i == 1) {
        var page_link = document.createElement("a");
        page_link.setAttribute("href", "/doctor?page_requested=previous&current_page="+current_page_value);
        page_link.setAttribute("id", "previous");
        page_link.innerHTML = "&laquo;";
        page_link.classList.add("pagination_button");
        console.log("prev page button", page_link);
        pagination.appendChild(page_link);
        if(current_page==1){
            document.getElementById("previous").remove();
        }
    }
    var i_string = i.toString();
    var current_page_string = current_page.toString();
    var page_link = document.createElement("a");
    page_link.setAttribute("href", "/doctor?page_requested="+i_string+"&current_page="+current_page_value);
    page_link.setAttribute("id", i_string);
    page_link.innerHTML = i;
    page_link.classList.add("pagination_button");
    if (i_string == current_page_string) {
        page_link.classList.add("active_page");
    }
    console.log("page number button", page_link);
    pagination.appendChild(page_link);
    if (i == pages_needed) {
        var page_link = document.createElement("a");
        page_link.setAttribute("href", "/doctor?page_requested=next&current_page="+current_page_value);
        page_link.setAttribute("id", "next");
        page_link.innerHTML = "&raquo;";
        page_link.classList.add("pagination_button");
        console.log("next page button", page_link);
        pagination.appendChild(page_link);
        if(current_page==pages_needed){
            document.getElementById("next").remove();
        }
    }
}


var pages_needed_mobile = parseInt(document.getElementById("pages_needed_mobile").innerHTML);
console.log("pages needed are", pages_needed_mobile);
var current_page_mobile = parseInt(document.getElementById("current_page_mobile").innerHTML);
console.log("current page value is ", current_page_mobile);
var pagination_mobile = document.getElementById("pagination_mobile");
console.log("pagination div found is ", pagination);
var current_page_value = current_page_mobile.toString();
for (var i = 1; i <= pages_needed_mobile; i++) {
    if (i == 1) {
        var page_link_mobile = document.createElement("a");
        page_link_mobile.setAttribute("href", "/doctor?page_requested=previous&current_page="+current_page_value);
        page_link_mobile.setAttribute("id", "previous_mobile");
        page_link_mobile.innerHTML = "&laquo;";
        page_link_mobile.classList.add("pagination_button_mobile");
        console.log("prev page button", page_link_mobile);
        pagination_mobile.appendChild(page_link_mobile);
        if(current_page_mobile==1){
            document.getElementById("previous_mobile").remove();
        }
    }
    var i_string = i.toString();
    var current_page_string = current_page_mobile.toString();
    var page_link_mobile = document.createElement("a");
    page_link_mobile.setAttribute("href", "/doctor?page_requested="+i_string+"&current_page="+current_page_value);
    // page_link_mobile.setAttribute("id", i_string);
    page_link_mobile.innerHTML = i;
    page_link_mobile.classList.add("pagination_button_mobile");
    if (i_string == current_page_string) {
        page_link_mobile.classList.add("active_page_mobile");
    }
    console.log("page number button", page_link_mobile);
    pagination_mobile.appendChild(page_link_mobile);
    if (i == pages_needed_mobile) {
        var page_link_mobile = document.createElement("a");
        page_link_mobile.setAttribute("href", "/doctor?page_requested=next&current_page="+current_page_value);
        page_link_mobile.setAttribute("id", "next_mobile");
        page_link_mobile.innerHTML = "&raquo;";
        page_link_mobile.classList.add("pagination_button_mobile");
        console.log("next page button", page_link_mobile);
        pagination_mobile.appendChild(page_link_mobile);
        if(current_page_mobile==pages_needed_mobile){
            document.getElementById("next_mobile").remove();
        }
    }
}


