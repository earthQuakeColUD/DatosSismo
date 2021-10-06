"use stirct"

const SchemaDB = require("../modelosDatos/datosSismos");

//Guardar cuenta nueva
async function saveDB(req) {
    try {
        var data = new SchemaDB();
        data.descripcion = req.descripcion
        data.tipoMovimento = req.tipoMovimento
        data.fecha = req.fecha
        data.longitud = req.longitud
        data.latitud = req.latitud
        data.magnitud = req.magnitud
        const save = await data.save((err, res) => { })
    }
    catch (e) {
        console.log("error catch guardar: " + e)
    }
};

//obtine el ultimo sismo
async function lastEarthquake() {
    var response = await SchemaDB.find().sort({$natural:-1}).limit(1);
    return response;
}

//obtine los ultimos sismos
async function allEarthquake() {
    var response = await SchemaDB.find().sort({$natural:-1}).limit(5);
    return response;
}

//obtine los ultimos sismos
async function Earthquake() {
    var response = await SchemaDB.find();
    return response;
}

//eliminar los documentos de sismo
async function deleteEarthquake() {
    var response = await SchemaDB.deleteMany();
    return response;
}

module.exports = { saveDB, lastEarthquake, allEarthquake, Earthquake, deleteEarthquake };