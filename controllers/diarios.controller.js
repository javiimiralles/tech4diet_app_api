const Diario = require('../models/diario.model');
const Usuario = require('../models/usuario.model');
const Alimento = require('../models/alimento.model');
const { response } = require('express');
const { infoToken } = require('../utils/infotoken');

const getDiarioById = async(req, res = response) => {
    const id = req.params.id;

    console.log('Obteniendo diario con id: ', id);

    try {

        const diario = await Diario.findById(id);

        // KO -> diario no existe
        if(!diario) {
            return res.status(400).json({
                ok: false,
                msg: "No existe ningún diario para el id: " + id
            });
        }

        // OK 
        res.json({
            ok: true,
            msg: 'getDiarioById',
            diario
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo diario por id'
        });
    }
}

const getDiarioByUser = async(req, res = response) => {
    const fecha = Date.parse(req.query.fecha);
    const idUsuario = req.params.idUsuario;

    console.log(`Obteniendo diario del usuario: ${idUsuario} en la fecha: ${fecha}`);

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
        const diario = await Diario.findOne({ idUsuario, fecha: { $gte: fechaActual, $lt: fechaSiguiente } })
                                    .populate('alimentosConsumidos.idAlimento');

        return res.json({
            ok: true,
            msg: 'getDiarioByUser',
            diario
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo diarios por usuario'
        });
    }
}

const createDiario = async(req, res = response) => {

    console.log('Creando diario: ', req.body);

    // Cuando se crea un diario se hace con todos los valores por defecto, y luego se actualiza
    const { idUsuario, ...object } = req.body;

    let { fecha } = req.body;

    if(!fecha) {
        fecha = new Date();
    } else {
        fecha = new Date(fecha);
    }

    try {

        const usuario = await Usuario.findById(idUsuario);

        // KO -> usuario no existe
        if(!usuario) {
            return res.status(400).json({
                ok:false,
                msg:"No existe ningún usuario para el id: " + idUsuario
            });
        }

        const fechaAnterior = new Date(fecha);
        fechaAnterior.setHours(0, 0, 0, 0);
        fechaAnterior.setDate(fechaAnterior.getDate());
        const fechaSiguiente = new Date(fechaAnterior);
        fechaSiguiente.setDate(fechaAnterior.getDate() + 1);

        const existeDiario = await Diario.findOne({ fecha: { $gte: fechaAnterior, $lt: fechaSiguiente }, idUsuario });

        // KO -> Ya existe un diario para este usuario y esta fecha
        if(existeDiario) {
            return res.status(400).json({
                ok: false,
                msg: "Ya existe un diario para este usuario y esta fecha",
            })
        }

        object.fecha = fecha;
        object.idUsuario = idUsuario;
        const diario = new Diario(object);

        diario.alimentosConsumidos = [];

        await diario.save();

        // OK
        res.json({
            ok:true,
            msg:"createDiario",
            diario
        })
    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error creando diario'
        });
    }
}

const updateDiario = async(req, res = response) => {

    console.log('Editando diario: ', req.body);

    const { fecha, idUsuario, aguaConsumida, caloriasGastadas, alimentosConsumidos, ...object } = req.body;
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

        // KO -> se esta intentado editar un diario de otro usuario
        if(infoToken(token).uid != idUsuario) {
            return res.status(400).json({
                ok:false,
                msg:"No se pueden editar diarios de otro usuario"
            });
        }

        let existeDiario = await Diario.findById(id);

        // KO -> no existe ningún diario con ese id
        if(!existeDiario) {
            return  res.status(400).json({
                ok: false,
                msg: "Este diario no existe"
            });
        }

        object.fecha = fecha;
        object.idUsuario = idUsuario;
        object.aguaConsumida = aguaConsumida >= 0 ? aguaConsumida : 0;
        object.caloriasGastadas = caloriasGastadas >= 0 ? caloriasGastadas : 0;
        const diario = await Diario.findByIdAndUpdate(id, object, { new: true });

        // OK
        res.json({
            ok: true,
            msg: "updateDiario",
            diario
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error editando diario'
        });
    }
}

const updateAlimentosConsumidos = async(req, res = response) => {

    console.log('Editando alimentos consumidos de un diario: ', req.body);

    const { idUsuario, ...object } = req.body;
    let { alimentoAgregar, alimentoEliminar, alimentoEditar } = req.body;
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

        // KO -> se esta intentado editar un diario de otro usuario
        if(infoToken(token).uid != idUsuario) {
            return res.status(400).json({
                ok:false,
                msg:"No se pueden editar diarios de otro usuario"
            });
        }

        let existeDiario = await Diario.findById(id);

        // KO -> no existe ningún diario con ese id
        if(!existeDiario) {
            return  res.status(400).json({
                ok: false,
                msg: "Este diario no existe"
            });
        }

        const alimentosConsumidos = existeDiario.alimentosConsumidos;
        let caloriasConsumidas = existeDiario.caloriasConsumidas;
        let carbosConsumidos = existeDiario.carbosConsumidos;
        let proteinasConsumidas = existeDiario.proteinasConsumidas;
        let grasasConsumidas = existeDiario.grasasConsumidas;

        // --------- Agregar alimento consumido
        if(alimentoAgregar != null) {
            alimentoAgregar = JSON.parse(alimentoAgregar);
            const existeAlimento = await Alimento.findById(alimentoAgregar.idAlimento);
            // KO -> no existe el alimento a añadir
            if(!existeAlimento) {
                return  res.status(400).json({
                    ok: false,
                    msg: "El alimento que se va a añadir no existe"
                });
            }

            const cantidadReferencia = existeAlimento.cantidadReferencia;
            const cantidadAgregar = alimentoAgregar.cantidad;

            const caloriasSumar = Math.round((existeAlimento.calorias * cantidadAgregar) / cantidadReferencia);
            const carbosSumar = Math.round((existeAlimento.carbohidratos * cantidadAgregar) / cantidadReferencia);
            const proteinasSumar = Math.round((existeAlimento.proteinas * cantidadAgregar) / cantidadReferencia);
            const grasasSumar = Math.round((existeAlimento.grasas * cantidadAgregar) / cantidadReferencia);

            caloriasConsumidas += caloriasSumar;
            carbosConsumidos += carbosSumar;
            proteinasConsumidas += proteinasSumar
            grasasConsumidas += grasasSumar;

            alimentoAgregar.calorias = caloriasSumar;
            alimentoAgregar.carbohidratos = carbosSumar;
            alimentoAgregar.proteinas = proteinasSumar;
            alimentoAgregar.grasas = grasasSumar;
            alimentosConsumidos.push(alimentoAgregar);

        } 
        // ------ Eliminar alimento consumido
        else if(alimentoEliminar != null) {
            alimentoEliminar = JSON.parse(alimentoEliminar);
            const index = alimentoEliminar.index;

            // KO -> index es incorrecto
            if(index > alimentosConsumidos.length - 1) {
                return  res.status(400).json({
                    ok: false,
                    msg: "El alimento que se va a eliminar no está en la lista"
                });
            }

            const alimentoBD = await Alimento.findById(alimentosConsumidos[index].idAlimento);

            const cantidadReferencia = alimentoBD.cantidadReferencia;

            const cantidadEliminar = alimentosConsumidos[index].cantidad;
            caloriasConsumidas -= Math.round((alimentoBD.calorias * cantidadEliminar) / cantidadReferencia);
            carbosConsumidos -= Math.round((alimentoBD.carbohidratos * cantidadEliminar) / cantidadReferencia);
            proteinasConsumidas -= Math.round((alimentoBD.proteinas * cantidadEliminar) / cantidadReferencia);
            grasasConsumidas -= Math.round((alimentoBD.grasas * cantidadEliminar) / cantidadReferencia);
            alimentosConsumidos.splice(index, 1);
        }
        // -------- Editar alimento consumido
        else if(alimentoEditar != null) {
            alimentoEditar = JSON.parse(alimentoEditar);
            const index = alimentoEditar.index;
            const cantidadSumar = alimentoEditar.cantidad;

            // KO -> index es incorrecto
            if(index > alimentosConsumidos.length - 1) {
                return  res.status(400).json({
                    ok: false,
                    msg: "El alimento que se va a editar no está en la lista"
                });
            }

            const alimentoBD = await Alimento.findById(alimentosConsumidos[index].idAlimento);
            const cantidadReferencia = alimentoBD.cantidadReferencia;

            // Primero eliminamos las calorias y macros del alimento original
            const cantidadEliminar = alimentosConsumidos[index].cantidad;
            caloriasConsumidas -= Math.round((alimentoBD.calorias * cantidadEliminar) / cantidadReferencia);
            carbosConsumidos -= Math.round((alimentoBD.carbohidratos * cantidadEliminar) / cantidadReferencia);
            proteinasConsumidas -= Math.round((alimentoBD.proteinas * cantidadEliminar) / cantidadReferencia);
            grasasConsumidas -= Math.round((alimentoBD.grasas * cantidadEliminar) / cantidadReferencia);

            // Añadimos las nuevas calorias y macros
            const caloriasSumar = Math.round((alimentoBD.calorias * cantidadSumar) / cantidadReferencia);
            const carbosSumar = Math.round((alimentoBD.carbohidratos * cantidadSumar) / cantidadReferencia);
            const proteinasSumar = Math.round((alimentoBD.proteinas * cantidadSumar) / cantidadReferencia);
            const grasasSumar = Math.round((alimentoBD.grasas * cantidadSumar) / cantidadReferencia);

            caloriasConsumidas += caloriasSumar;
            carbosConsumidos += carbosSumar;
            proteinasConsumidas += proteinasSumar;
            grasasConsumidas += grasasSumar;

            alimentosConsumidos[index].cantidad = cantidadSumar;
            alimentosConsumidos[index].calorias = caloriasSumar;
            alimentosConsumidos[index].carbohidratos = carbosSumar;
            alimentosConsumidos[index].proteinas = proteinasSumar;
            alimentosConsumidos[index].grasas = grasasSumar;
        }
        else {
            return res.status(400).json({
                ok: false,
                msg: "Se debe pasar un alimento para añadir, eliminar o editar"
            });
        }

        object.idUsuario = idUsuario;
        object.alimentosConsumidos = alimentosConsumidos;
        object.caloriasConsumidas = caloriasConsumidas;
        object.carbosConsumidos = carbosConsumidos;
        object.proteinasConsumidas = proteinasConsumidas;
        object.grasasConsumidas = grasasConsumidas;
        const diario = await Diario.findByIdAndUpdate(id, object, { new: true });

        // OK
        res.json({
            ok: true,
            msg: "updateAlimentosConsumidos",
            diario
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error editando diario'
        });
    }
}

const deleteDiario = async(req, res = response) => {

    const id = req.params.id;
    const token = req.header('x-token');

    console.log('Eliminando diario con id: ', id);

    try {

        const existeDiario = await Diario.findById(id);

        // KO -> no existe ningún diario con ese id
        if(!existeDiario) {
            return res.status(400).json({
                ok: false,
                msg: "No existe ningún diario con ese id: " + id
            });
        }

        // KO -> se esta intentado eliminar un registro de otro usuario
        if(infoToken(token).uid != existeDiario.idUsuario) {
            return res.status(400).json({
                ok: false,
                msg: "No se pueden eliminar diarios de otro usuario"
            });
        }

        const diarioEliminado = await Diario.findByIdAndDelete(id);

        // OK
        res.json({
            ok:true,
            msg:"deleteDiario",
            diarioEliminado
        })

    } catch(error){
        console.log(error);
        return res.json({
            ok: false,
            msg: 'Error borrando diario'
        })
    }
}

module.exports = {
    getDiarioById,
    getDiarioByUser,
    createDiario,
    updateDiario,
    updateAlimentosConsumidos,
    deleteDiario
}