const Usuario = require('../models/usuario.model');
const MedidaCorporal = require('../models/medida-corporal.model');
const { response } = require('express');
const { infoToken } = require('../utils/infotoken');

// cuando el usuario se registra se crearan unas medidas corporales por defecto
const createMedidasCorporalesDefault = async(idUsuario) => {

    console.log('Creando medidas corporales por defecto');

    try {
        const medidasParaInsertar = [
            { nombre: 'Pecho', bilateral: false, idUsuario: idUsuario },
            { nombre: 'Biceps', bilateral: true, idUsuario: idUsuario },
            { nombre: 'Cadera', bilateral: false, idUsuario: idUsuario },
            { nombre: 'Muslos', bilateral: true, idUsuario: idUsuario }
        ];

        const medidasInsertadas = await MedidaCorporal.insertMany(medidasParaInsertar);

    } catch(error){
        console.log(error);
    }
}

const getMedidaCorporalById = async(req, res = response) => {

    const id = req.params.id;

    console.log('Obteniendo medida corporal por id: ', id);

    try {

        const medida = await MedidaCorporal.findById(id);

        // KO -> medida no existe
        if(!medida) {
            return res.status(400).json({
                ok: false,
                msg: "No existe ninguna medida para el id: " + id
            });
        }

        // OK 
        res.json({
            ok: true,
            msg: 'getMedidaCorporalById',
            medida
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo medida por id'
        });
    }
}

const getMedidasCorporalesByUser = async(req, res = response) => {

    const idUsuario = req.params.idUsuario;

    console.log('Obteniendo medidas corporales del usuario: ', idUsuario);

    try {

        const usuario = await Usuario.findById(idUsuario);

        // KO -> usuario no existe
        if(!usuario) {
            return res.status(400).json({
                ok:false,
                msg:"No existe ningún usuario para el id: " + idUsuario
            });
        }

        const medidas = await MedidaCorporal.find({ idUsuario });

        return res.json({
            ok: true,
            msg: 'getMedidasCorporalesByUser',
            medidas
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo medidas por usuario'
        });
    }
}

const createMedidaCorporal = async(req, res = response) => {

    console.log('Creando medida corporal: ', req.body);
    
    const { idUsuario, ...object } = req.body;

    try {

        const usuario = await Usuario.findById(idUsuario);

        // KO -> usuario no existe
        if(!usuario) {
            return res.status(400).json({
                ok:false,
                msg:"No existe ningún usuario para el id: " + idUsuario
            });
        }

        object.idUsuario = idUsuario;
        const medida = new MedidaCorporal(object);

        await medida.save();

        // OK
        res.json({
            ok:true,
            msg:"createMedidaCorporal",
            medida
        })

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error creando medida corporal'
        });
    }
}

const updateMedidaCorporal = async(req, res = response) => {

    console.log('Editando medida corporal: ', req.body);

    const { idUsuario, nombre, bilateral, ...object } = req.body;
    const id = req.params.id;
    const token = req.header('x-token');

    try {

        const usuario = await Usuario.findById(idUsuario);

        // KO -> usuario no existe
        if(!usuario) {
            return res.status(400).json({
                ok:false,
                msg:"No existe ningún usuario para el id: " + idUsuario
            });
        }

        // KO -> se esta intentado editar una media corporal de otro usuario
        if(infoToken(token).uid != idUsuario) {
            return res.status(400).json({
                ok:false,
                msg:"No se pueden editar medidas de otro usuario"
            });
        }

        const existeMedida = await MedidaCorporal.findById(id);

        // KO -> no existe ninguna medida corporal con ese id
        if(!existeMedida) {
            return  res.status(400).json({
                ok: false,
                msg: "Este registro de medida corporal no existe"
            });
        }

        object.idUsuario = idUsuario;
        object.nombre = nombre;
        object.bilateral = bilateral;

        const medida = await MedidaCorporal.findByIdAndUpdate(id, object, { new: true });

        // OK
        res.json({
            ok: true,
            msg: "updateMedidaCorporal",
            medida
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error editando medida corporal'
        });
    }
}

const deleteMedidaCorporal = async(req, res = response) => {

    const id = req.params.id;
    const token = req.header('x-token');
    
    console.log('Eliminando medida corporal con id: ', id);

    try {

        const existeMedida = await MedidaCorporal.findById(id);

        // KO -> no existe ninguna medida corporal con ese id
        if(!existeMedida) {
            return  res.status(400).json({
                ok:false,
                msg:"No existe ninguna medida corporal con ese id: " + id
            });
        }

        // KO -> se esta intentado eliminar un registro de medida corporal de otro usuario
        if(infoToken(token).uid != existeMedida.idUsuario) {
            return res.status(400).json({
                ok: false,
                msg: "No se pueden eliminar registros medidas corporales de otro usuario"
            });
        }

        const medidaEliminada = await MedidaCorporal.findByIdAndDelete(id);

        res.json({
            ok:true,
            msg:"deleteMedidaCorporal",
            medidaEliminada
        })

    } catch(error){
        console.log(error);
        return res.json({
            ok: false,
            msg: 'Error borrando medida corporal'
        })
    }
}

module.exports = {
    createMedidasCorporalesDefault,
    getMedidaCorporalById,
    getMedidasCorporalesByUser,
    createMedidaCorporal,
    updateMedidaCorporal,
    deleteMedidaCorporal
}
