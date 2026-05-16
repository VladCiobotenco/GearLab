window.onload=function(){

    function valideazaInputuri() {
        let isValid = true;
        let mesajEroare = "";

        // Pentru tip produs - interzis cifre
        let inpTip = document.getElementById("inp-tip");
        if (inpTip && /\d/.test(inpTip.value)) {
            isValid = false;
            mesajEroare += "Tipul produsului nu poate conține cifre!\n";
            inpTip.style.border = "2px solid red";
        } else if (inpTip) {
            inpTip.style.border = "";
        }

        // Pentru nume - interzis caractere speciale
        let inpNume = document.getElementById("inp-nume");
        if (inpNume && inpNume.value.trim() !== "" && /[^a-zA-Z0-9\s\-]/.test(inpNume.value)) {
            isValid = false;
            mesajEroare += "Numele produsului poate conține doar litere, cifre, spații și cratime!\n";
            inpNume.style.border = "2px solid red";
        } else if (inpNume) {
            inpNume.style.border = "";
        }

        // Pentru descriere - minim 3 caractere
        let inpDescriere = document.getElementById("inp-descriere");
        if (inpDescriere && inpDescriere.value.trim() !== "" && inpDescriere.value.trim().length < 3) {
            isValid = false;
            mesajEroare += "Dacă completați descrierea, introduceți cel puțin 3 caractere!\n";
            inpDescriere.classList.add("is-invalid");
        } else if (inpDescriere) {
            inpDescriere.classList.remove("is-invalid");
        }

        if (!isValid) {
            alert(mesajEroare);
        }
        return isValid;
    }

    document.getElementById("inp-masa").onchange=function(){
        let val=this.value.trim()
        document.getElementById("infoRange").innerHTML=`(${val})`
    }

    let inpDescriere = document.getElementById("inp-descriere");
    if (inpDescriere) {
        inpDescriere.oninput = function() {
            if (this.value.trim() === "" || this.value.trim().length >= 3) {
                this.classList.remove("is-invalid");
            }
        }
    }

    document.getElementById("filtrare").onclick=function(){
        if (!valideazaInputuri()) return;

        let inpNume=document.getElementById("inp-nume").value.trim().toLowerCase()
        let grupRadio=document.getElementsByName("gr_rad")
        let valRadio="toate";

        for (let rad of grupRadio){
            if (rad.checked){
                valRadio = rad.value.toLowerCase();
                break
            }
        }

        let inpMasa = parseFloat(document.getElementById("inp-masa").value) || 0;

        let inpCategorie = document.getElementById("inp-categorie").value.trim().toLowerCase();

        let inpPret = document.getElementById("inp-pret").checked;

        let inpTip = document.getElementById("inp-tip").value.toLowerCase();

        let selectMateriale = document.getElementById("inp-materiale");
        let valoriMateriale = Array.from(selectMateriale.selectedOptions).map(opt => opt.value.toLowerCase());
        let numaiBugetMateriale = valoriMateriale.includes("toate");

        let inpDescriere = document.getElementById("inp-descriere").value.trim().toLowerCase();

        let produse=document.getElementsByClassName("produs")

        for(let produs of produse){
            
            produs.style.display="none"
            
            let valNume = produs.getElementsByClassName("val-nume")[0];
            let nume = valNume ? valNume.textContent.trim().toLowerCase() : "";
            let cond1=nume.includes(inpNume)

            let valMasa = produs.getElementsByClassName("val-masa")[0];
            let masa = valMasa ? parseFloat(valMasa.textContent.trim()) : 0;
            let cond2 = masa > inpMasa;

            let valGaming = produs.getElementsByClassName("val-pt_gaming")[0];
            let isGaming = valGaming ? valGaming.textContent.trim().toLowerCase() : "";
            
            let cond3 = false;
            if (valRadio === "toate") {
                cond3 = true;
            } else {
                let cuvinteDa = ["da", "true", "are", "1", "yes"];
                
                let isGamingBool = cuvinteDa.some(cuvant => isGaming.includes(cuvant));
                let valRadioBool = cuvinteDa.includes(valRadio);
                cond3 = (isGamingBool === valRadioBool);
            }

            let valTip = produs.getElementsByClassName("val-tip_produs")[0];
            let tip = valTip ? valTip.textContent.trim().toLowerCase() : "";
            let cond4 = !inpTip.trim() || tip === inpTip;

            let valPret = produs.getElementsByClassName("val-pret")[0];
            let pret = valPret ? parseFloat(valPret.textContent.trim()) : 0;
            let cond5 = !inpPret || pret < 500;

            let valCategorie = produs.getElementsByClassName("val-categorie")[0];
            let categorie = valCategorie ? valCategorie.textContent.trim().toLowerCase() : "";
            let cond6 = inpCategorie === "toate" || categorie === inpCategorie;

            let cond7 = true;
            if (!numaiBugetMateriale && valoriMateriale.length > 0) {
                let tabelMateriale = produs.querySelector(".info-prod tbody tr:nth-child(3) td");
                let materiale = tabelMateriale ? tabelMateriale.textContent.trim().toLowerCase() : "";
                cond7 = valoriMateriale.some(material => materiale.includes(material));
            }

            let valDescriere = produs.getElementsByClassName("val-descriere")[0];
            let descriere = valDescriere ? valDescriere.textContent.trim().toLowerCase() : "";
            let cond8 = !inpDescriere || descriere.includes(inpDescriere);

            if(cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8){
                produs.style.display="block"
            }
        }
    }

    document.getElementById("resetare").onclick=function(){
        if(confirm("Sunteți sigur că doriți să resetați filtrele?")) {
            document.getElementById("inp-nume").value=""
            document.getElementById("inp-categorie").value="toate"
            document.getElementById("inp-pret").checked = false;
            document.getElementById("inp-tip").value = "";
            document.getElementById("inp-descriere").value = "";
            
            let inpMasa = document.getElementById("inp-masa");
            inpMasa.value = inpMasa.min || 0;
            document.getElementById("infoRange").innerHTML=`(${inpMasa.value})`;
            
            let radToate = document.querySelector('input[name="gr_rad"][value="toate"]');
            if(radToate) radToate.checked = true;

            let selectMateriale = document.getElementById("inp-materiale");
            for (let option of selectMateriale.options) {
                option.selected = option.value === "toate";
            }

            let produse=document.getElementsByClassName("produs")
            for(let prod of produse){
                prod.style.display=""
            }
        }
    }

    document.getElementById("sortCrescNume").onclick=function(){
        if (!valideazaInputuri()) return;
        sorteaza(1);
    }

    document.getElementById("sortDescrescNume").onclick=function(){
        if (!valideazaInputuri()) return;
        sorteaza(-1);
    }

    function sorteaza(semn){
        let produse=document.getElementsByClassName("produs")
        let vProduse=Array.from(produse)
        vProduse.sort(function(a,b){
            let pretA = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML.trim());
            let pretB = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML.trim());
            if (pretA == pretB){
                let numeA = a.getElementsByClassName("val-nume")[0].innerHTML.toLocaleLowerCase();
                let numeB = b.getElementsByClassName("val-nume")[0].innerHTML.toLocaleLowerCase();
                return semn*numeA.localeCompare(numeB);
            }
            return semn*(pretA - pretB);
        })

        for(let prod of vProduse)
            prod.parentNode.appendChild(prod);

    }

    window.onkeydown=function(e){
        if(e.key=="c" && e.altKey){
            let suma=0;
            let produse=document.getElementsByClassName("produs")
            for(let prod of produse){
                if(prod.style.display!="none")
                    suma+=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim())
            }

            let p=this.document.getElementById("infoSuma")
            if(!p){
                let p=document.createElement("p");
                p.innerHTML=suma;
                p.id="infoSuma";
                let sectiuneProduse=this.document.getElementById("produse");
                sectiuneProduse.parentElement.insertBefore(p,sectiuneProduse);

                this.setTimeout(function(){
                    let p1=this.document.getElementById("infoSuma")
                    if(!p1)
                    {
                        p1.remove()
                    }
                },2000)
            }
            else {p.innerHTML=suma;}
        }
    }   
}
