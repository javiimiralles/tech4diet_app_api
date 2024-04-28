const Usuario = require('../models/usuario.model');
const ActividadFisica = require('../models/actividad-fisica.model');
const ActividadRealizada = require('../models/actividad-realizada.model');
const { response } = require('express');
const { infoToken } = require('../utils/infotoken');
const { restarCaloriasGastadas } = require('./actividades-realizadas.controller');

const getActividadFisicaById = async (req, res = response) => {

    const id = req.params.id;

    console.log(`Obteniendo actividad física por id: ${id}`);

    try {

        const actividadFisica = await ActividadFisica.findById(id);

        // KO -> actividad no existe
        if (!actividadFisica) {
            return res.status(400).json({
                ok: false,
                msg: "No existe ninguna actividad para el id: " + id
            });
        }

        // OK 
        res.json({
            ok: true,
            msg: 'getActividadFisicaById',
            actividadFisica
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error obteniendo actividad por id'
        });
    }
}

const getActividadesFisicas = async (req, res = response) => {

    console.log('Obteniendo actividades físicas');

    const desde = Number(req.query.desde) || 0;
    const resultados = Number(req.query.resultados) || Number(process.env.DOCSPERPAGE);
    const texto = req.query.texto;
    const idUsuario = req.query.idUsuario;

    let textoBusqueda = '';
    if (texto) {
        textoBusqueda = new RegExp(texto, 'i');
    }

    try {
        
        if(idUsuario) {
            const usuario = await Usuario.findById(idUsuario);
    
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    msg: "No existe ningún usuario para el id: " + idUsuario
                });
            }
        }

        let filter = {};

        if (idUsuario) {
            filter.idUsuario = idUsuario;
        } else {
            filter.predeterminada = true;
        }

        if (texto) {
            filter.nombre = textoBusqueda;
        }

        const [actividadesFisicas, total] = await Promise.all([
            ActividadFisica.find(filter).skip(desde).limit(resultados),
            ActividadFisica.countDocuments(filter)
        ]);

        res.json({
            ok: true,
            msg: 'getActividadesFisicas',
            actividadesFisicas,
            page: {
                desde,
                resultados,
                total
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error obteniendo actividades por filtro'
        });
    }
}

const createActividadFisica = async (req, res = response) => {

    console.log('Creando actividad física: ', req.body);

    const { nombre, idUsuario, ...object } = req.body;

    try {

        const usuario = await Usuario.findById(idUsuario);

        // KO -> usuario no existe
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: "No existe ningún usuario para el id: " + idUsuario
            });
        }

        const existeActividad = await ActividadFisica.findOne({
            $or: [
                { nombre: nombre, idUsuario: idUsuario },
                { nombre: nombre, predeterminada: true }
            ]
        });

        // KO -> existe una actividad fisica con ese nombre
        // No mandamos status 400 porque queremos que siga funcionando
        if (existeActividad) {
            return res.json({
                ok: false,
                msg: "Ya existe una actividad física con ese nombre",
                alimento: existeActividad
            });
        }

        object.nombre = nombre;
        object.idUsuario = idUsuario;
        object.predeterminada = false; // un usuario nunca podra crear una predeterminada
        const actividadFisica = new ActividadFisica(object);

        await actividadFisica.save();

        // OK
        res.json({
            ok: true,
            msg: "createActividadFisica",
            actividadFisica
        })

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error creando actividad fisica'
        });
    }

}

const updateActividadFisica = async (req, res = response) => {

    console.log('Editando actividad física: ', req.body);

    const { nombre, idUsuario, ...object } = req.body;
    const id = req.params.id;
    const token = req.header('x-token');

    try {

        const usuario = await Usuario.findById(idUsuario);

        // KO -> usuario no existe
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: "No existe ningún usuario para el id: " + idUsuario
            });
        }

        // KO -> se esta intentado editar un alimento de otro usuario
        if (infoToken(token).uid != idUsuario) {
            return res.status(400).json({
                ok: false,
                msg: "No se pueden editar actividades de otro usuario"
            });
        }

        let existeActividad = await ActividadFisica.findById(id);
        // KO -> No se pueden editar actividades predeterminadas
        if (existeActividad.predeterminada) {
            return res.status(400).json({
                ok: false,
                msg: "No se pueden editar actividades predeterminadas"
            });
        }

        existeActividad = await ActividadFisica.findOne({
            $or: [
                { nombre: nombre, idUsuario: idUsuario },
                { nombre: nombre, predeterminada: true }
            ]
        });

        // KO -> existe una actividad fisica con ese nombre
        // No mandamos status 400 porque queremos que siga funcionando
        if (existeActividad && existeActividad._id != id) {
            return res.json({
                ok: false,
                msg: "Ya existe una actividad física con ese nombre",
                alimento: existeActividad
            });
        }

        object.nombre = nombre;
        object.idUsuario = idUsuario;
        const actividadFisica = await ActividadFisica.findByIdAndUpdate(id, object, { new: true });

        // OK
        res.json({
            ok: true,
            msg: "updateActividadFisica",
            actividadFisica
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error editando actividad fisica'
        });
    }
}

const deleteActividadFisica = async (req, res = response) => {

    const id = req.params.id;
    const token = req.header('x-token');

    console.log(`Eliminando actividad física con id: ${id}`);

    try {

        const existeActividad = await ActividadFisica.findById(id);

        // KO -> no existe ninguna actividad con ese id
        if (!existeActividad) {
            return res.status(400).json({
                ok: false,
                msg: "No existe ninguna actividad con ese id: " + id
            });
        }

        // KO -> No se pueden borrar actividades predeterminadas
        if (existeActividad.predeterminada) {
            return res.status(400).json({
                ok: false,
                msg: "No se pueden borrar actividades predeterminadas"
            });
        }

        // KO -> se esta intentado eliminar una actividad de otro usuario
        if (infoToken(token).uid != existeActividad.idUsuario) {
            return res.status(400).json({
                ok: false,
                msg: "No se pueden eliminar actividades de otro usuario"
            });
        }

        const actividadEliminada = await ActividadFisica.findByIdAndDelete(id);

        // borramos las actividades realizadas asociadas a esta actividad
        // y recalculamos las calorias gastadas del diario
        const actividadesRealizadasABorrar = await ActividadRealizada.find({ idActividadFisica: id });
        const promesas = actividadesRealizadasABorrar.map(async (actividad) => {
            await restarCaloriasGastadas(actividad);
        });
        await Promise.all(promesas);

        await ActividadRealizada.deleteMany({ idActividadFisica: id });

        res.json({
            ok: true,
            msg: "deleteActividadFisica",
            actividadEliminada
        })

    } catch (error) {
        console.log(error);
        return res.json({
            ok: false,
            msg: 'Error borrando actividad fisica'
        })
    }

}

module.exports = {
    getActividadFisicaById,
    getActividadesFisicas,
    createActividadFisica,
    updateActividadFisica,
    deleteActividadFisica
}