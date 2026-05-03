window.onload=function(){
    document.getElementById("filtrare").onclick=function(){
        let inpNume=document.getElementById("inp-nume").value.trim().toLowerCase()
        let produse=document.getElementsByClassName("produs")
        for(let produs of produse){
            produs.style.display="none"
            let nume=produs.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
            // e un vector cu un element, trebuie selectat primul element
            let cond1=nume.includes(inpNume)
            if(cond1){
                produs.style.display="block"
            }
        }
    }
}