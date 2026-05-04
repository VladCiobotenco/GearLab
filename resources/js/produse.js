window.onload=function(){
    document.getElementById("filtrare").onclick=function(){
        let inpNume=document.getElementById("inp-nume").value.trim().toLowerCase()
        let produse=document.getElementsByClassName("produs")
        for(let produs of produse){
            
            produs.style.display="none"
            let nume=produs.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
            // e un vector cu un element, trebuie selectat primul element
            let cond1=nume.includes(inpNume)







            let inpCategorie = document.getElementById("inp-categorie").trim().toLowerCase();
            let cond4=getElementsByClassName("val-categorie")[0].innerHTML.trim().toLowerCase() == inpCategorie || inpCategorie == "toate";


            if(cond1 && cond4){
                produs.style.display="block"
            }
        }
    }

    document.getElementById("resetare").onclick=function(){
        document.getElementById("inp-nume").value=""
        document.getElementById("inp-pret").value=0;
        document.getElementById("infoRange").innerHTML="(0)";
        document.getElementById("inp-categorie").value="toate"
        document.getElementById("i_rad4").checked=true;

        for(let prod of produse){
            prod.style.display="block"
        }
    }
}



