const Usuario = require('../models/usuario.model');
const FotoProgreso = require('../models/foto-progreso.model');
const { response } = require('express');
const { infoToken } = require('../utils/infotoken');
const cloudinary = require('cloudinary').v2;

const getFotoProgresoById = async(req, res = response) => {

    const id = req.params.id;

    console.log('Obteniendo foto de progreso con id: ', id);

    try {

        const fotoProgreso = await FotoProgreso.findById(id);

        // KO -> fotoProgreso no existe
        if(!fotoProgreso) {
            return res.status(400).json({
                ok: false,
                msg: "No existe ninguna foto para el id: " + id
            });
        }

        // OK 
        res.json({
            ok: true,
            msg: 'getFotoProgresoById',
            fotoProgreso
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo foto por id'
        });
    }
}

const getFotosProgresoByUser = async(req, res = response) => {
    const fecha = Date.parse(req.query.fecha);
    const idUsuario = req.params.idUsuario;

    console.log(`Obteniendo foto de progreso del usuario: ${idUsuario} en la fecha: ${fecha}`);

    try {

        const usuario = await Usuario.findById(idUsuario);

        // KO -> usuario no existe
        if(!usuario) {
            return res.status(400).json({
                ok:false,
                msg:"No existe ningún usuario para el id: " + idUsuario
            });
        }

        const fechaActual = new Date(fecha);
        fechaActual.setHours(0, 0, 0, 0);
        const fechaSiguiente = new Date(fecha);
        fechaSiguiente.setDate(fechaActual.getDate() + 1);
        const fotosProgreso = await FotoProgreso.find({ idUsuario, fecha: { $gte: fechaActual, $lt: fechaSiguiente } });

        return res.json({
            ok: true,
            msg: 'getFotosProgresoByUser',
            fotosProgreso
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo fotos por usuario'
        });
    }
}

const uploadFotoProgreso = async(req, res = response) => {

    console.log('Subiendo foto de porgreso');

    if(!req.files || Object.keys(req.files).length === 0){
        return res.status(400).json({
            ok: false,
            msg: 'No se ha enviado ninguna imagen',
        });
        
    }

    if(req.files.imagen.truncated){
        return res.status(400).json({
            ok: false,
            msg: `El archivo es demasiado grande, permitido hasta '${process.env.MAXSIZEUPLOAD}'MB`,
        });
    }

    const formatosValidos = ['jpeg','jpg','png','JPG','JPEG','PNG'];

    const imagen = req.files.imagen;
    const nombrePartido = imagen.name.split('.');
    const extension = nombrePartido[nombrePartido.length - 1];

    if(!formatosValidos.includes(extension)){
        return res.status(400).json({
            ok: false,
            msg: `Formato de la imagen inválido`
        });
    }

    const { idUsuario, ...object } = req.body;
    let fecha = req.body.fecha;
    try {

        fecha = fecha != null ? new Date(fecha) : new Date();
        
        const usuario = await Usuario.findById(idUsuario);

        // KO -> usuario no existe
        if(!usuario) {
            return res.status(400).json({
                ok:false,
                msg:"No existe ningún usuario para el id: " + idUsuario
            });
        }

        const fechaActual = new Date(fecha);
        fechaActual.setHours(0, 0, 0, 0);
        const fechaSiguiente = new Date(fecha);
        fechaSiguiente.setDate(fechaActual.getDate() + 1);
        const numFotos = await FotoProgreso.countDocuments({ idUsuario, fecha: { $gte: fechaActual, $lt: fechaSiguiente } });
        // KO -> no pueden haber mas de 6 fotos para un mismo día
        if(numFotos > 6) {
            return res.status(400).json({
                ok:false,
                msg: "Se ha superado el límite de fotos para esta fecha"
            });
        }

        // Subir la imagen a Cloudinary
        cloudinary.uploader.upload_stream({
            resource_type: 'image',
        }, async (error, result) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error al subir la imagen a Cloudinary',
                    error
                });
            }

            object.fecha = fecha;
            object.url = result.secure_url;
            object.idCloudinary = result.public_id;
            object.idUsuario = idUsuario;

            const fotoProgreso = new FotoProgreso(object);

            await fotoProgreso.save();

            res.json({
                ok: true,
                msg: 'uploadFotoProgreso',
                foto: fotoProgreso
            });
        }).end(imagen.data);

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error subiendo la foto'
        });
    }
}

const deleteFotoProgreso = async(req, res = response) => {

    const id = req.params.id;
    const token = req.header('x-token');

    console.log('Eliminando foto de progreso con id: ', id);

    try {

        const existeFoto = await FotoProgreso.findById(id);

        // KO -> no existe ninguna foto con ese id
        if(!existeFoto) {
            return  res.status(400).json({
                ok:false,
                msg:"No existe ninguna foto con ese id: " + id
            });
        }

        // KO -> se esta intentado eliminar un registro de otro usuario
        if(infoToken(token).uid != existeFoto.idUsuario) {
            return res.status(400).json({
                ok: false,
                msg: "No se pueden eliminar fotos de otro usuario"
            });
        }

        const result = await cloudinary.uploader.destroy(existeFoto.idCloudinary);

        if (result.result === 'ok') {

            const fotoEliminada = await FotoProgreso.findByIdAndDelete(id);

            res.json({
                ok:true,
                msg:"deleteFotoProgreso",
                fotoEliminada
            });
            
        } else {
            return res.status(400).json({
                ok: false,
                msg: "Error al eliminar la foto de Cloudinary"
            });
        }

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error borrando la foto'
        });
    }
}

module.exports = {
    getFotoProgresoById,
    getFotosProgresoByUser,
    uploadFotoProgreso,
    deleteFotoProgreso
}