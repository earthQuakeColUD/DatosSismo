"use strict";

const express = require("express"),
    app = express(),
    config = require("./config/dataConfig"),
    logic= require("./routers/logicaConsultarSismos"),
    CronJob = require("node-cron"),
    mongoose = require("mongoose");


var coneccion = mongoose.connect("mongodb://localhost:27017/appEarthQuake", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {

        console.log("coneccion exitosa")
        return true;
    })
    .catch(err => {
        console.log("coneccion fallida")
        return false;
    });

// Configurar cabeceras y CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT');
    res.header('Allow', 'GET, POST, PUT');
    next();
});

app.use(express.urlencoded({ extended: false }))
    .use(express.json())
    .use(require("./routers/service.js"))
    .use(express.urlencoded({ limit: '50mb', extended: true }))
if (coneccion) {
    app.listen(config.port, () => { 
        console.log("corriendo servicio, puerto" + config.port) 
        logic.stateEartquakeDB();
        setInterval(()=>{logic.actualizacion()},10000)
               
    })
}
 
  


