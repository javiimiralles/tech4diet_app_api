const { response } = require('express');
const Usuario = require('../models/usuario.model');
const Modelo3D = require('../models/modelo3D.model');
const { v4: uuidv4 } = require('uuid');
const { subirArchivo } = require('./uploads.controller');
const fs = require('fs');
const { infoToken } = require('../utils/infotoken');

const getModelo3DById = async(req, res = response) => {

    const idModelo = req.params.id;

    console.log('Obteniendo modelo 3D con id: ', idModelo);

    try {

        const modelo3D = await Modelo3D.findById(idModelo);

        // No devolvemos status porque queremos que siga funcionando
        if (!modelo3D) {
            return res.json({
                ok: false,
                msg: "Modelo 3D no encontrado."
            });
        }

        // OK
        res.json({
            ok: true,
            msg: "getModelo3DById",
            modelo3D
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno al obtener el modelo 3D'
        });
    }
}

const getModelos3DByUser = async(req, res = response) => {

    const idUsuario = req.params.idUsuario;

    console.log('Obteniendo modelos 3D del usuario: ', idUsuario);

    try {

        const usuario = await Usuario.findById(idUsuario);

        // KO -> usuario no existe
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: "No existe ningún usuario para el id: " + idUsuario
            });
        }

        const modelos3D = await Modelo3D.find({ idUsuario }).sort({ fecha: 1 });

        // No devolvemos status porque queremos que siga funcionando
        if (!modelos3D) {
            return res.json({
                ok: false,
                msg: "Modelo 3D no encontrado."
            });
        }

        // OK
        res.json({
            ok: true,
            msg: "getModelos3DByUser",
            modelos3D
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno al obtener los modelos 3D'
        });
    }
}

const subirModelo3D = async(req, res = response) => {

    console.log('Subiendo modelo 3D');

    const { idUsuario, fecha, ...object } = req.body;

    if (!req.files || !req.files.archivoModelo) {
        return res.status(400).json({
            ok: false,
            msg: "No se ha subido ningún archivo"
        });
    }

    if(req.files.archivoModelo.truncated){
        return res.status(400).json({
            ok: false,
            msg: `El tamaño máximo permitido es de ${process.env.MAXSIZEUPLOAD}MB`,
        });
    }

    const extensionesValidas = ['gltf', 'glb'];
    const archivoModelo = req.files.archivoModelo;
    const nombrePartido = archivoModelo.name.split('.');
    const extension = nombrePartido[nombrePartido.length - 1];

    if(!extensionesValidas.includes(extension)) {
        return res.status(400).json({
            ok: false,
            msg: `Los formatos permitidos son: GLTF y GLB. Puedes usar Blender para exportar el modelo`,
        });
    }

    const nombreArchivo = `${uuidv4()}.${extension}`;
    const path = `${process.env.PATH_UPLOAD}/${nombreArchivo}`;

    try {
        const usuario = await Usuario.findById(idUsuario);
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: "No existe ningún usuario para el id: " + idUsuario
            });
        }

        const fechaActual = new Date(fecha);
        fechaActual.setHours(0, 0, 0, 0);
        const fechaSiguiente = new Date(fecha);
        fechaSiguiente.setDate(fechaActual.getDate() + 1);
        const existeModelo = await Modelo3D.find({ idUsuario, fecha: { $gte: fechaActual, $lt: fechaSiguiente } });
        if(existeModelo && existeModelo.length > 0) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya hay un modelo subido para esta fecha'
            });
        }

        await subirArchivo(archivoModelo, path);

        object.nombre = nombreArchivo;
        object.url = path;
        object.idUsuario = idUsuario;
        object.fecha = fecha;
        const modelo3D = new Modelo3D(object);

        await modelo3D.save();

        res.json({
            ok: true,
            msg: "subirModelo3D",
            modelo3D
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno al subir el modelo 3D'
        });
    }
}

const deleteModelo3D = async(req, res = response) => {
    const id = req.params.id;
    const token = req.header('x-token');

    console.log('Eliminando modelo 3D con id: ', id);

    try {

        const existeModelo = await Modelo3D.findById(id);

        // KO -> no existe ningun modelo con ese id
        if(!existeModelo) {
            return  res.status(400).json({
                ok:false,
                msg:"No existe ningún modelo con ese id: " + id
            });
        }

        // KO -> se esta intentado eliminar un modelo 3D de otro usuario
        if(infoToken(token).uid != existeModelo.idUsuario) {
            return res.status(400).json({
                ok: false,
                msg: "No se pueden eliminar modelos 3D de otro usuario"
            });
        }

        const modeloEliminado = await Modelo3D.findByIdAndDelete(id);

        res.json({
            ok:true,
            msg:"deleteModelo3D",
            modeloEliminado
        })

        const pathModelo = modeloEliminado.url;
        if(fs.existsSync(pathModelo)) {
            fs.unlinkSync(pathModelo);
        }


    } catch(error){
        console.log(error);
        return res.json({
            ok: false,
            msg: 'Error borrando modelo 3D'
        })
    }
}

module.exports = {
    getModelo3DById,
    getModelos3DByUser,
    subirModelo3D,
    deleteModelo3D
}