const Alimento = require('../models/alimento.model');
const Usuario = require('../models/usuario.model');
const { response } = require('express');
const { infoToken } = require('../utils/infotoken');

const getAlimentoById = async(req, res = response) => {

    const id = req.params.id;

    try {

        const alimento = await Alimento.findById(id);

        // KO -> alimento no existe
        if(!alimento) {
            return res.status(400).json({
                ok: false,
                msg: "No existe ningún alimento para el id: " + id
            });
        }

        // OK 
        res.json({
            ok: true,
            msg: 'getAlimentoById',
            alimento
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo alimento por id'
        });
    }
}

const getAlimentosByUser = async(req, res = response) => {
    const desde = Number(req.query.desde) || 0;
    const resultados = Number(req.query.resultados) || Number(process.env.DOCSPERPAGE);
    const texto = req.query.texto;

    let textoBusqueda = '';
    if (texto) {
        textoBusqueda = new RegExp(texto, 'i');
    }

    const idUsuario = req.params.idUsuario;

    try {

        const usuario = await Usuario.findById(idUsuario);

        // KO -> usuario no existe
        if(!usuario) {
            return res.status(400).json({
                ok:false,
                msg:"No existe ningún usuario para el id: " + idUsuario
            });
        }

        let alimentos, total;
        if(texto) {
            [alimentos, total] = await Promise.all([
                Alimento.find({ nombre: textoBusqueda, idUsuario: idUsuario }).skip(desde).limit(resultados),
                Alimento.countDocuments({ nombre: textoBusqueda, idUsuario: idUsuario })
            ]);
        } else {
            [alimentos, total] = await Promise.all([
                Alimento.find({ idUsuario: idUsuario }).skip(desde).limit(resultados),
                Alimento.countDocuments({ idUsuario: idUsuario })
            ]);
        }

        res.json({
            ok: true,
            msg: 'getAlimentosByUser',
            alimentos,
            page: {
                desde,
                resultados,
                total
            }
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo alimentos por usuario'
        });
    }
}

const createAlimento = async(req, res = response) => {

    const { nombre, idUsuario, cantidadReferencia, ...object } = req.body;
    
    try {

        const usuario = await Usuario.findById(idUsuario);

        // KO -> usuario no existe
        if(!usuario) {
            return res.status(400).json({
                ok:false,
                msg:"No existe ningún usuario para el id: " + idUsuario
            });
        }

        const existeAlimento = await Alimento.findOne({ nombre, idUsuario });

        // KO -> existe un alimento con ese nombre para ese usuario
        // No mandamos status 400 porque queremos que siga funcionando
        if(existeAlimento) {
            return  res.json({
                ok:false,
                msg:"Ya existe un alimento con ese nombre",
                alimento: existeAlimento
            });
        }

        object.nombre = nombre;
        object.idUsuario = idUsuario;
        object.cantidadReferencia = cantidadReferencia != null && cantidadReferencia !== '' ? cantidadReferencia : 'gramos';
        const alimento = new Alimento(object);

        await alimento.save();

        // OK
        res.json({
            ok:true,
            msg:"createAlimento",
            alimento
        })

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error creando alimento'
        });
    }
}

const updateAlimento = async(req, res = response) => {

    const { nombre, idUsuario, cantidadReferencia, ...object } = req.body;
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

        // KO -> se esta intentado editar un alimento de otro usuario
        if(infoToken(token).uid != idUsuario) {
            return res.status(400).json({
                ok:false,
                msg:"No se pueden editar alimentos de otro usuario"
            });
        }

        const existeAlimento = await Alimento.findOne({ nombre, idUsuario });

        // KO -> existe un alimento con ese nombre para ese usuario
        if(existeAlimento && existeAlimento._id != id) {
            return res.status(400).json({
                ok:false,
                msg:"Ya existe un alimento con ese nombre"
            });
        }

        object.nombre = nombre;
        object.idUsuario = idUsuario;
        object.cantidadReferencia = cantidadReferencia != null && cantidadReferencia !== '' ? cantidadReferencia : 'gramos';
        const alimento = await Alimento.findByIdAndUpdate(id, object, { new: true });

        // OK
        res.json({
            ok:true,
            msg:"updateAlimento",
            alimento
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error editando alimento'
        });
    }
}

const deleteAlimento = async(req, res = response) => {
    
    const id = req.params.id;
    const token = req.header('x-token');

    try {
        
        const existeAlimento = await Alimento.findById(id);

        // KO -> no existe un alimento con ese id
        if(!existeAlimento) {
            return  res.status(400).json({
                ok:false,
                msg:"No existe ningún alimento con ese id: " + id
            });
        }

        // KO -> se esta intentado eliminar un alimento de otro usuario
        if(infoToken(token).uid != existeAlimento.idUsuario) {
            return res.status(400).json({
                ok:false,
                msg:"No se pueden eliminar alimentos de otro usuario"
            });
        }

        const alimentoEliminado = await Alimento.findByIdAndDelete(id);

        res.json({
            ok:true,
            msg:"deleteAlimento",
            alimentoEliminado
        })

    } catch(error){
        console.log(error);
        return  res.json({
            ok:false,
            msg:'Error borrando alimento'
        })
    }
}

module.exports = {
    getAlimentoById,
    getAlimentosByUser,
    createAlimento,
    updateAlimento,
    deleteAlimento
}