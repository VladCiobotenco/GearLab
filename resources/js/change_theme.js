window.addEventListener("DOMContentLoaded", function(){
    let btn = document.getElementById("schimba_tema");
    
    if (localStorage.getItem("tema")) {
        btn.checked = true;
    } else {
        btn.checked = false;
    }

    btn.onclick = function(){
        if(document.body.classList.contains("dark")){
            document.body.classList.remove("dark")
            localStorage.removeItem("tema");
        }
        else{
            document.body.classList.add("dark")
            localStorage.setItem("tema","dark");
        }
    }
});