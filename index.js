const express= require("express");
const fs=require("fs");
const path= require("path");
const sass=require("sass");
const sharp=require("sharp");

app= express();
app.set("view engine", "ejs")

obGlobal={                                          //Un obiect de erori
    obErori:null,
    obImagini:null,
    folderScss:path.join(__dirname, "resources/scss"),
    folderCss:path.join(__dirname, "resources/css"),
    folderBackup:path.join(__dirname, "backup"),
}

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

app.get("/cale",function(req,res){
    res.send("<b style='color:red;'>Salut din /cale</b>");
    console.log("Am primit o cerere GET pe /cale");
})

app.get("/cale2",function(req,res){
    res.write("ceva\n");
    res.write("altceva");
    res.end();
})

app.get("/cale/:a/:b",function(req,res){
    res.send(parseInt(req.params.a) + parseInt(req.params.b));
    console.log("Am primit o cerere GET pe /cale");
});

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
        ip:req.ip,       //Il accesam in index.ejs cu locals.ip
        imagine:obGlobal.obImagini.imagini
    });
});
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

app.listen(8080);   
console.log("Serverul a pornit!");