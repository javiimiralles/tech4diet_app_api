const { response } = require('express');
const fs = require('fs');

const getArchivo = async(req, res = response) => {

    const fileName = req.params.fileName;
    const path = `${process.env.PATH_UPLOAD}/${fileName}`;

    console.log('Obteniendo archivo con nombre: ', fileName);

    if(!fs.existsSync(path)) {
        return null;
    }

    res.sendFile(path);
}

const subirArchivo = async(archivo, path) => {

    console.log('Subiendo archivo');

    const moveFile = () => {
        return new Promise((resolve, reject) => {
            archivo.mv(path, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    await moveFile();
} 

module.exports = { subirArchivo, getArchivo }