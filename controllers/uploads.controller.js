const { response } = require('express');
const fs = require('fs');

const getArchivo = async(req, res = response) => {

    const fileName = req.params.fileName;
    const path = `${process.env.PATH_UPLOAD}/${fileName}`;

    if(!fs.existsSync(path)) {
        return null;
    }

    res.sendFile(path);
}

const subirArchivo = async(archivo, path) => {
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