const Usuario = require('../models/usuario.model');
const ActividadRealizada = require('../models/actividad-realizada.model');
const ActividadFisica = require('../models/actividad-fisica.model');
const Diario = require('../models/diario.model');
const { response } = require('express');
const { infoToken } = require('../utils/infotoken');

const getActividadRealizadaById = async(req, res = response) => {

    const id = req.params.id;

    console.log(`Obteniendo actividad realizada con id: ${id}`);

    try {

        const actividadRealizada = await ActividadRealizada.findById(id).populate('idActividadFisica');

        // KO -> actividad no existe
        if(!actividadRealizada) {
            return res.status(400).json({
                ok: false,
                msg: "No existe ninguna actividad para el id: " + id
            });
        }

        // OK 
        res.json({
            ok: true,
            msg: 'getActividadFisicaById',
            actividadRealizada
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo actividad realizada por id'
        });
    }
}

const getActividadesRealizadasByUser = async(req, res = response) => {

    const fecha = Date.parse(req.query.fecha);
    const idUsuario = req.params.idUsuario;

    console.log(`Obteniendo actividades realizadas para el usuario: ${id} en la fecha: ${fecha}`);

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
        const actividadesRealizadas = await ActividadRealizada.find({ idUsuario, fecha: { $gte: fechaActual, $lt: fechaSiguiente } })
                                                    .populate('idActividadFisica');

        return res.json({
            ok: true,
            msg: 'getActividadesRealizadasByUser',
            actividadesRealizadas
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo actividades realizadas por usuario'
        });
    }
}

const createActividadRealizada = async(req, res = response) => {

    console.log('Creando actividad realizada: ', req.body);

    const { fecha, caloriasGastadas, idActividadFisica, idUsuario, ...object } = req.body;

    try {

        const usuario = await Usuario.findById(idUsuario);

        // KO -> usuario no existe
        if(!usuario) {
            return res.status(400).json({
                ok:false,
                msg:"No existe ningún usuario para el id: " + idUsuario
            });
        }

        const actividadFisica = await ActividadFisica.findById(idActividadFisica);

        // KO -> actividadFisica no existe
        if(!actividadFisica) {
            return res.status(400).json({
                ok:false,
                msg:"No existe ninguna actividad fisica para el id: " + idActividadFisica
            });
        }
        
        // Tenemos que actualizar las calorias gastadas del diario
        const fechaAnterior = new Date(fecha);
        fechaAnterior.setHours(0, 0, 0, 0);
        fechaAnterior.setDate(fechaAnterior.getDate());
        const fechaSiguiente = new Date(fechaAnterior);
        fechaSiguiente.setDate(fechaAnterior.getDate() + 1);
        const diario = await Diario.findOne({ fecha: { $gte: fechaAnterior, $lt: fechaSiguiente }, idUsuario });
        
        // si no existe un diario para esa fecha lo creamos
        if(!diario) {
            const nuevoDiario = new Diario({ fecha, alimentosConsumidos: [], caloriasGastadas, idUsuario });
            await nuevoDiario.save();
        } else {
            diario.caloriasGastadas += + parseInt(caloriasGastadas);
            await Diario.findByIdAndUpdate(diario._id, diario, { new: true });
        }
        
        object.fecha = fecha;
        object.caloriasGastadas = caloriasGastadas;
        object.idActividadFisica = idActividadFisica;
        object.idUsuario = idUsuario;
        const actividadRealizada = new ActividadRealizada(object);
        await actividadRealizada.save();
        // OK
        res.json({
            ok: true,
            msg: "createActividadRealizada",
            actividadRealizada
        })

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error creando actividad realizada'
        });
    }

}

const updateActividadRealizada = async(req, res = response) => {

    console.log('Editando actividad realizada: ', req.body);

    const { fecha, caloriasGastadas, idActividadFisica, idUsuario, ...object } = req.body;
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

        // KO -> se esta intentado editar una actividad de otro usuario
        if(infoToken(token).uid != idUsuario) {
            return res.status(400).json({
                ok:false,
                msg:"No se pueden editar actividades de otro usuario"
            });
        }

        const actividadFisica = await ActividadFisica.findById(idActividadFisica);

        // KO -> actividadFisica no existe
        if(!actividadFisica) {
            return res.status(400).json({
                ok:false,
                msg:"No existe ninguna actividad fisica para el id: " + idActividadFisica
            });
        }

        const existeActividadRealizada = await ActividadRealizada.findById(id);

        // KO -> actividad realizada no existe
        if(!existeActividadRealizada) {
            return res.status(400).json({
                ok:false,
                msg:"No existe ninguna actividad realizada para el id: " + idActividadFisica
            });
        }

        // Tenemos que actualizar las calorias gastadas del diario
        const fechaAnterior = new Date(fecha);
        fechaAnterior.setHours(0, 0, 0, 0);
        fechaAnterior.setDate(fechaAnterior.getDate());
        const fechaSiguiente = new Date(fechaAnterior);
        fechaSiguiente.setDate(fechaAnterior.getDate() + 1);
        const diario = await Diario.findOne({ fecha: { $gte: fechaAnterior, $lt: fechaSiguiente }, idUsuario });
        
        // si no existe un diario para esa fecha lo creamos
        if(!diario) {
            const nuevoDiario = new Diario({ fecha, alimentosConsumidos: [], caloriasGastadas, idUsuario });
            await nuevoDiario.save();
        } else {
            diario.caloriasGastadas -= existeActividadRealizada.caloriasGastadas;
            diario.caloriasGastadas += caloriasGastadas;
            await Diario.findByIdAndUpdate(diario._id, diario, { new: true });
        }

        object.fecha = fecha;
        object.caloriasGastadas = caloriasGastadas;
        object.idActividadFisica = idActividadFisica;
        object.idUsuario = idUsuario;
        const actividadRealizada = await ActividadRealizada.findByIdAndUpdate(id, object, { new: true });

        // OK
        res.json({
            ok: true,
            msg: "updateActividadRealizada",
            actividadRealizada
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error editando actividad realizada'
        });
    }

}

const deleteActividadRealizada = async(req, res = response) => {

    const id = req.params.id;
    const token = req.header('x-token');

    console.log(`Eliminando actividad realizada con id: ${id}`);

    try {

        const existeActividadRealizada = await ActividadRealizada.findById(id);

        // KO -> no existe ninguna actividad realizada con ese id
        if(!existeActividadRealizada) {
            return res.status(400).json({
                ok: false,
                msg: "No existe ninguna actividad realizada con ese id: " + id
            });
        }

        // KO -> se esta intentado eliminar una actividad realizada de otro usuario
        if(infoToken(token).uid != existeActividadRealizada.idUsuario) {
            return res.status(400).json({
                ok: false,
                msg: "No se pueden eliminar actividades de otro usuario"
            });
        }

        // Tenemos que actualizar las calorias gastadas del diario
        await restarCaloriasGastadas(existeActividadRealizada);

        const actividadRealizadaEliminada = await ActividadRealizada.findByIdAndDelete(id);

        // OK
        res.json({
            ok:true,
            msg:"deleteActividadRealizada",
            actividadRealizadaEliminada
        })

    } catch(error){
        console.log(error);
        return res.json({
            ok: false,
            msg: 'Error borrando actividad realizada'
        })
    }
}

const restarCaloriasGastadas = async(actividadRealizada) => {
    const idUsuario = actividadRealizada.idUsuario;
    const fecha = new Date(actividadRealizada.fecha);
    const fechaAnterior = new Date(fecha);
    fechaAnterior.setHours(0, 0, 0, 0);
    fechaAnterior.setDate(fechaAnterior.getDate());
    const fechaSiguiente = new Date(fechaAnterior);
    fechaSiguiente.setDate(fechaAnterior.getDate() + 1);
    const diario = await Diario.findOne({ fecha: { $gte: fechaAnterior, $lt: fechaSiguiente }, idUsuario });

    if(diario) {
        diario.caloriasGastadas -= actividadRealizada.caloriasGastadas;
        await Diario.findByIdAndUpdate(diario._id, diario, { new: true });
    }
}

module.exports = {
    getActividadRealizadaById,
    getActividadesRealizadasByUser,
    createActividadRealizada,
    updateActividadRealizada,
    deleteActividadRealizada,
    restarCaloriasGastadas,
}