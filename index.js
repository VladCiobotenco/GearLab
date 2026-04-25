const express= require("express");
const fs=require("fs");
const path= require("path");
const sass=require("sass");
const sharp=require("sharp");
const pg=require("pg");

app= express();
app.set("view engine", "ejs")

client=new pg.Client({
    database: "gearlab",
    user:"ciobo",
    password:"ciobo",
    host:"localhost",
    port:5432
})
client.connect()

obGlobal={                                          
    obErori:null,
    obImagini:null,
    folderScss:path.join(__dirname, "resources/scss"),
    folderCss:path.join(__dirname, "resources/css"),
    folderBackup:path.join(__dirname, "backup"),
}

function verificaErori() {
    const caleErori = path.join(__dirname, "resources/json/erori.json");

    if (!fs.existsSync(caleErori)) {
        console.error("Eroare Critică: Nu există fișierul erori.json la calea " + caleErori);
        process.exit();
    }
    
    const continut = fs.readFileSync(caleErori, "utf-8");
    let eroriObj;
    try {
        eroriObj = JSON.parse(continut);
    } catch (e) {
        console.error("Eroare la parsare erori.json:", e.message);
        return;
    }
    
    if (!eroriObj.info_erori || !eroriObj.cale_baza || !eroriObj.eroare_default) {
        console.error("Eroare: Lipsesc una sau mai multe proprietăți esențiale (info_erori, cale_baza, eroare_default) din erori.json.");
    }

    if (eroriObj.eroare_default) {
        let errDef = eroriObj.eroare_default;
        if (!errDef.titlu || !errDef.text || !errDef.imagine) {
            console.error("Eroare: Pentru eroarea default lipseste una dintre proprietățile obligatorii: titlu, text sau imagine.");
        }
    }

    let rawCaleBaza = eroriObj.cale_baza ? (eroriObj.cale_baza.startsWith("/") ? eroriObj.cale_baza.substring(1) : eroriObj.cale_baza) : "";
    let caleBazaAbs = path.join(__dirname, rawCaleBaza);
    if (!fs.existsSync(caleBazaAbs)) {
        console.error(`Eroare: Folderul specificat în "cale_baza" (${eroriObj.cale_baza}) nu există în sistemul de fișiere.`);
    } else {
        if (eroriObj.eroare_default && eroriObj.eroare_default.imagine && !fs.existsSync(path.join(caleBazaAbs, eroriObj.eroare_default.imagine))) {
            console.error(`Eroare: Fisierul imagine pentru eroarea default (${eroriObj.eroare_default.imagine}) nu există fizic în ${caleBazaAbs}.`);
        }
        if (eroriObj.info_erori) {
            for (let err of eroriObj.info_erori) {
                if (err.imagine && !fs.existsSync(path.join(caleBazaAbs, err.imagine))) {
                    console.error(`Eroare: Fisierul imagine pentru eroarea ${err.identificator} (${err.imagine}) nu există fizic în ${caleBazaAbs}.`);
                }
            }
        }
    }

    //detectia erorilor duplicate
    if (eroriObj.info_erori) {
        let idCount = {};
        for (let err of eroriObj.info_erori) {
            idCount[err.identificator] = (idCount[err.identificator] || 0) + 1;
        }
        for (let id in idCount) {
            if (idCount[id] > 1) {
                let duplicates = eroriObj.info_erori.filter(e => e.identificator == id);
                let props = duplicates.map(d => {
                    let clone = { ...d };
                    delete clone.identificator;
                    return JSON.stringify(clone);
                }).join("|");
                console.error(`Eroare: Există mai multe erori cu identificatorul [${id}]. Proprietățile acestora sunt: ${props}`);
            }
        }
    }

    //detectia proprietatilor duplicate
    
    const matchObiecte = continut.match(/\{[^{}]*\}/g);
    if (matchObiecte) {
        for (let obiectString of matchObiecte) {
            let chei = [...obiectString.matchAll(/"([^"]+)"\s*:/g)].map(m => m[1]);
            let vazute = new Set();
            for (let cheie of chei) {
                if (vazute.has(cheie)) {
                    console.error(`Eroare JSON: Proprietatea '${cheie}' este specificată de mai multe ori în același obiect!`);
                }
                vazute.add(cheie);
            }
        }
    }
}
verificaErori();

function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resources/json/erori.json")).toString("utf-8");//Functia de init de citire a erorilor din resources/json/erori.json
    let erori=obGlobal.obErori=JSON.parse(continut)
    let err_default=erori.eroare_default
    err_default.imagine=path.join(erori.cale_baza, err_default.imagine)
    for (let eroare of erori.info_erori){
        eroare.imagine=path.join(erori.cale_baza, eroare.imagine)
    }
}
initErori()

function compileazaScss(caleScss, caleCss){
    if(!caleCss){

        let numeFisExt=path.basename(caleScss); // "folder1/folder2/a.scss" -> "a.scss"
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css"; // output: a.css
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    
    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }
    
    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))// +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    
}


//la pornirea serverului
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resources/json/galerie.json")).toString("utf-8");

    try {
        obGlobal.obImagini=JSON.parse(continut);
    } catch (err) {
        console.error("Eroare la parsarea 'galerie.json': Fisierul este gol sau are un format JSON invalid.");
        obGlobal.obImagini = { imagini: [], cale_galerie: "" };
        return;
    }
    let vImagini=obGlobal.obImagini.imagini;
    let caleGalerie=obGlobal.obImagini.cale_galerie

    let caleAbs=path.join(__dirname,caleGalerie);
    let caleAbsMediu=path.join(caleAbs, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);
    
    for (let imag of vImagini){
        [numeFis, ext]=imag.fisier.split("."); //"ceva.png" -> ["ceva", "png"]
        let caleFisAbs=path.join(caleAbs,imag.fisier);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        imag.fisier_mediu=path.join("/", caleGalerie, "mediu", numeFis+".webp" )
        imag.fisier=path.join("/", caleGalerie, imag.fisier )
        
    }
    // console.log(obGlobal.obImagini)
}
initImagini();

function afisareaEroare(res,identificator,titlu,text,imagine){
    // let eroare=obGlobal.obErori.info_erori.find(function(elem){
    //     return elem.identificator==identificator
    // })
    let eroare = obGlobal.obErori.info_erori.find((elem)=>elem.identificator==identificator);      // Functie arrowhead

    let errDefault = obGlobal.obErori.eroare_default;
    res.render("pages/eroare",{
        imagine: imagine || eroare?.imagine || errDefault.imagine,
        titlu: titlu || eroare?.titlu || errDefault.titlu,
        text: text || eroare ?.text || errDefault.text
    })
}

app.get("/eroare", function(req,res){
    afisareaEroare(res,"404")
});


console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

let vector_foldere=["temp","logs","backup","fisiere_uploadate"];
for(let folder of vector_foldere){
    let caleFolder=path.join(__dirname,folder);
    if(!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
}

app.use("/resources",express.static(path.join(__dirname,"resources")));
app.use("/dist",express.static(path.join(__dirname,"node_modules/bootstrap/dist")));


// Rute

// app.get("/cale",function(req,res){
//     res.send("<b style='color:red;'>Salut din /cale</b>");
//     console.log("Am primit o cerere GET pe /cale");
// })

// app.get("/cale2",function(req,res){
//     res.write("ceva\n");
//     res.write("altceva");
//     res.end();
// })

// app.get("/cale/:a/:b",function(req,res){
//     res.send(parseInt(req.params.a) + parseInt(req.params.b));
//     console.log("Am primit o cerere GET pe /cale");
// });

// app.get("/",function(req,res){
//     res.sendFile(path.join(__dirname, "index.html"));
// });
app.use("/resources",express.static(path.join(__dirname, "resources")));
// app.get("/resources/css/general.css",function(req,res){
//     res.sendFile(path.join(__dirname, "resources/css/general.css"));
// });

app.get("/favicon.ico",function(req,res){
    res.sendFile(path.join(__dirname,"resources/imagini/favicon/favicon.ico"))  //Cererea speciala favicon (cerinta 19)
})

app.get(["/","/index","/home"],function(req,res){
    res.render("pages/index",{
        ip:req.ip       //Il accesam in index.ejs cu locals.ip
    });
});

app.get("/despre",function(req,res){
    res.render("pages/despre.ejs",{
        imagini:obGlobal.obImagini.imagini
    })
})

app.get("/produse",function(req,res){

    let clauzaWhere=""
    if(req.query.tip){
        clauzaWhere=`where categorie='${req.query.tip}'`
    }

    client.query(`select * from periferice ${clauzaWhere}`, function(err,rez){
        if(err)
        {
            console.error("Database Error on /produse:", err.message);
            afisareaEroare(res,"2");
        }
        else {
            res.render("pages/produse",{
                produse:rez.rows,
                optiuni:[]
            })
        }
    })
})

app.get("/produs/:id",function(req,res){

    client.query(`select * from periferice where id=${req.params.id}`, function(err,rez){
        if(err)
        {
            afisareaEroare(res,"2");
        }
        else {
            if(rez.rowCount==0){
                afisareaEroare(res,"404","Produs inexistent");
                return;
            }
            res.render("pages/produs",{
                prod:rez.rows[0],
            })
        }
    })
})
// app.get("/despre",function(req,res){
//     res.render("pages/despre");
// });

app.get("/*pagina",function(req,res){       //Pentru a randa mai multe pagini deodata prin parametrul *pagina
    console.log("Cale pagina",req.url);
    if(req.url.startsWith("/resources")&&path.extname(req.url)==""){
        afisareaEroare(res,403);
        return;
    }
    if(req.url.endsWith(".ejs")){
        afisareaEroare(res,400);
        return;
    }
    try{
        res.render("pages" + req.url,function(err,rezRandare){
            if(err){
                if(err.message.startsWith("Failed to lookup view")){
                    afisareaEroare(res,404);
                    return;
                }
                afisareaEroare(res);       //Se afiseaza eroarea default
                return;
            }
            res.send(rezRandare);
            console.log("Randare:",rezRandare);   //Rezultatul compilarii de fisiere ejs
        });
    }
    catch(err){
        if(err.message.includes("Cannot find modules")){
            afisareaEroare(res,404);
            return;
        }
        afisareaEroare(res);
        return;
    }
    
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Serverul a pornit pe portul ${PORT}!`);
});