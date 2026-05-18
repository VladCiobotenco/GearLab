window.onload=function(){

    /// Sistemul de paginare

    let currentPage = 1;
    const K = 4; // Numarul produselor pe pagina
    let currentProducts = [];

    function renderPagination() {
        let N = currentProducts.length;
        let NRL = Math.ceil(N / K);
        
        if (currentPage > NRL) currentPage = 1;
        if (currentPage === 0 && NRL > 0) currentPage = 1;
        
        for (let prod of currentProducts) {
            prod.style.display = "none";
        }
        
        let container = document.getElementById("pagination-container");
        if (container) 
            container.innerHTML = "";
        
        if (N === 0) return;
        
        let startIndex = (currentPage - 1) * K;
        let endIndex = startIndex + K - 1;
        
        for (let i = startIndex; i <= endIndex && i < N; i++) {
            currentProducts[i].style.display = "block";
        }
        
        if (container) {
            for (let i = 1; i <= NRL; i++) {
                let btn = document.createElement("button");
                btn.className = "btn " + (i === currentPage ? "btn-primary" : "btn-outline-primary");
                btn.innerHTML = i;
                btn.onclick = function() {
                    currentPage = i;
                    renderPagination();
                };
                container.appendChild(btn);
            }
        }
    }

    /// Validarea inputurilor

    function valideazaInputuri() {
        let isValid = true;
        let mesajEroare = "";

        let inpTip = document.getElementById("inp-tip");
        if (inpTip && /\d/.test(inpTip.value)) {
            isValid = false;
            mesajEroare += "Tipul produsului nu poate conține cifre!\n";
            inpTip.style.border = "2px solid red";
        } else if (inpTip) {
            inpTip.style.border = "";
        }

        let inpNume = document.getElementById("inp-nume");
        if (inpNume && inpNume.value.trim() !== "" && /[^a-zA-Z0-9\s\-]/.test(inpNume.value)) {
            isValid = false;
            mesajEroare += "Numele produsului poate conține doar litere, cifre, spații și cratime!\n";
            inpNume.style.border = "2px solid red";
        } else if (inpNume) {
            inpNume.style.border = "";
        }

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
        filtreazaProduse();
    }

    let filterInputs = ["inp-nume", "inp-tip", "inp-pret", "inp-categorie", "inp-materiale", "inp-descriere"];
    for (let id of filterInputs) {
        let el = document.getElementById(id);
        if (el) {
            el.addEventListener("change", filtreazaProduse);
        }
    }

    let radioBtns = document.getElementsByName("gr_rad");
    for (let rad of radioBtns) {
        rad.addEventListener("change", filtreazaProduse);
    }

    let btnPins = document.getElementsByClassName("btn-pin");
    let btnHides = document.getElementsByClassName("btn-hide-temp");
    let btnDeletes = document.getElementsByClassName("btn-delete-session");
    
    for (let i = 0; i < btnPins.length; i++) {
        let btn = btnPins[i];
        btn.onclick = function() {
            let article = this.closest(".produs");
            article.classList.toggle("pinned");
            if (article.classList.contains("pinned")) {
                this.classList.replace("btn-outline-success", "btn-success");
                article.style.boxShadow = "0 0 10px 3px rgba(40, 167, 69, 0.5)";
            } else {
                this.classList.replace("btn-success", "btn-outline-success");
                article.style.boxShadow = "";
            }
        };
    }

    for (let i = 0; i < btnHides.length; i++) {
        let btn = btnHides[i];
        btn.onclick = function() {
            let article = this.closest(".produs");
            article.style.display = "none";
            currentProducts = currentProducts.filter(p => p !== article);
            renderPagination();
        };
    }

    for (let i = 0; i < btnDeletes.length; i++) {
        let btn = btnDeletes[i];
        btn.onclick = function() {
            let article = this.closest(".produs");
            let id = article.id.split("_")[1];
            
            let deletedIds = sessionStorage.getItem("deletedProducts");
            if (deletedIds) {
                deletedIds = JSON.parse(deletedIds);
            } else {
                deletedIds = [];
            }
            if (!deletedIds.includes(id)) {
                deletedIds.push(id);
                sessionStorage.setItem("deletedProducts", JSON.stringify(deletedIds));
            }
            
            article.style.display = "none";
            currentProducts = currentProducts.filter(p => p !== article);
            renderPagination();
        };
    }

    function eliminaDiacritice(text) {
        if (!text) return "";
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function filtreazaProduse(){

        if (!valideazaInputuri()) return;

        let inpNume=eliminaDiacritice(document.getElementById("inp-nume").value.trim().toLowerCase());
        
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
        let showAllMaterials = valoriMateriale.includes("toate");

        let inpDescriere = eliminaDiacritice(document.getElementById("inp-descriere").value.trim().toLowerCase());

        let produse=document.getElementsByClassName("produs")
        let produseFiltrate = [];

        let deletedIds = sessionStorage.getItem("deletedProducts");
        deletedIds = deletedIds ? JSON.parse(deletedIds) : [];

        for(let produs of produse){
            
            produs.style.display="none"

            let idProdus = produs.id.split("_")[1];
            if (deletedIds.includes(idProdus)) {
                continue;
            }

            if (produs.classList.contains("pinned")) {
                produseFiltrate.push(produs);
                continue;
            }
            
            let valNume = produs.getElementsByClassName("val-nume")[0];
            let nume = valNume ? valNume.textContent.trim().toLowerCase() : "";
            let cond1=nume.includes(inpNume)

            let valMasa = produs.getElementsByClassName("val-masa")[0];
            let masa = valMasa ? parseFloat(valMasa.textContent.trim()) : 0;
            let cond2 = masa >= inpMasa;

            let valGaming = produs.getElementsByClassName("val-pt_gaming")[0];
            let isGaming = valGaming ? valGaming.textContent.trim().toLowerCase() : "";
            
            let cond3 = false;
            if (valRadio === "toate") {
                cond3 = true;
            } else if (valRadio === "true") {
                cond3 = isGaming.includes("da");
            } else if (valRadio === "false") {
                cond3 = isGaming.includes("nu");
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
            if (!showAllMaterials && valoriMateriale.length > 0) {
                let tabelMateriale = produs.querySelector(".info-prod tbody tr:nth-child(3) td");
                let materiale = tabelMateriale ? tabelMateriale.textContent.trim().toLowerCase() : "";
                cond7 = valoriMateriale.some(material => materiale.includes(material));
            }

            let valDescriere = produs.getElementsByClassName("val-descriere")[0];
            let descriere = valDescriere ? valDescriere.textContent.trim().toLowerCase() : "";
            let cond8 = !inpDescriere || descriere.includes(inpDescriere);

            if(cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8){
                produseFiltrate.push(produs)
            }
        }
        
        currentProducts = produseFiltrate;
        currentPage = 1;
        renderPagination();
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

            filtreazaProduse();
        }
    }

    document.getElementById("sortCresc").onclick=function(){
        if (!valideazaInputuri()) return;
        sorteaza(1);
    }

    document.getElementById("sortDescresc").onclick=function(){
        if (!valideazaInputuri()) return;
        sorteaza(-1);
    }

    function extrageValoare(element, cheie) {
        if (cheie === "nume") {
            let n = element.getElementsByClassName("val-nume")[0];
            return n ? n.innerHTML.trim().toLowerCase() : "";
        } else if (cheie === "pret") {
            let p = element.getElementsByClassName("val-pret")[0];
            return p ? parseFloat(p.innerHTML.trim()) : 0;
        } else if (cheie === "masa") {
            let m = element.getElementsByClassName("val-masa")[0];
            return m ? parseFloat(m.innerHTML.trim()) : 0;
        } else if (cheie === "categorie") {
            let c = element.getElementsByClassName("val-categorie")[0];
            return c ? c.innerHTML.trim().toLowerCase() : "";
        }
        return "";
    }

    function sorteaza(semn){
        let cheie1 = document.getElementById("sort-key-1").value;
        let cheie2 = document.getElementById("sort-key-2").value;

        if (cheie1 === cheie2) {
            alert("Vă rugăm să alegeți chei de sortare diferite!");
            return;
        }

        let produse=document.getElementsByClassName("produs")
        let vProduse=Array.from(produse)
        
        vProduse.sort(function(a,b){
            let val1A = extrageValoare(a, cheie1);
            let val1B = extrageValoare(b, cheie1);

            let cmp1 = 0;
            if (typeof val1A === "number" && typeof val1B === "number") {
                cmp1 = val1A - val1B;
            } else {
                cmp1 = val1A.localeCompare(val1B);
            }

            if (cmp1 !== 0) {
                return semn * cmp1;
            }

            let val2A = extrageValoare(a, cheie2);
            let val2B = extrageValoare(b, cheie2);

            let cmp2 = 0;
            if (typeof val2A === "number" && typeof val2B === "number") {
                cmp2 = val2A - val2B;
            } else {
                cmp2 = val2A.localeCompare(val2B);
            }

            return semn * cmp2;
        })

        for(let prod of vProduse)
            prod.parentNode.appendChild(prod);
        
        filtreazaProduse();
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
    
    // Initializare produse pe prima pagina
    filtreazaProduse();
}
