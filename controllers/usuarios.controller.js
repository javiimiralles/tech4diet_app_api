const Usuario = require('../models/usuario.model');
const RegistroPeso = require('../models/registro-peso.model');
const Alimento = require('../models/alimento.model');
const Diario = require('../models/diario.model');
const MedidaCorporal = require('../models/medida-corporal.model');
const ActividadFisica = require('../models/actividad-fisica.model');
const ActividadRealizada = require('../models/actividad-realizada.model');
const { response  }= require('express');
const bcrypt = require('bcryptjs');
const { createMedidasCorporalesDefault } = require('./medidas-corporales.controller');
const { SexoEnum } = require("../enums/sexo.enum");
const { PlanEnum } = require("../enums/plan.enum");
const { NivelActividadEnum } = require("../enums/nivel-actividad.enum");

const getUserById = async(req, res = response) => {
    const uid = req.params.id;

    try {
        const usuario = await Usuario.findById(uid);

        // KO -> usuario no existe
        if(!usuario) {
            return res.status(400).json({
                ok: false,
                msg: "No existe ningún usuario para el id: " + uid
            });
        }

        // OK 
        res.json({
            ok: true,
            msg: 'getUserById',
            usuario
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo usuario por id: ' + uid
        });
    }
}

const getUserByEmail = async(req, res = response) => {
    const email = req.params.email;

    try {
        const usuario = await Usuario.findOne({ email });

        // KO -> usuario no existe
        // No enviamos error 400 porque queremos que siga la ejecución
        if(!usuario) {
            return res.json({
                ok:false,
                msg:"No existe ningún usuario para el email: " + email
            });
        }

        // OK 
        res.json({
            ok: true,
            msg: 'getUserByEmail',
            usuario
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo usuario por email: ' + email
        });
    }
}

const createUser = async(req, res = response) => {

    const { email, password } = req.body;

    try{
        const existeEmail = await Usuario.findOne({ email });

        // KO -> existe un usuario con ese email
        if(existeEmail){
            return  res.status(400).json({
                ok: false,
                msg:"Ya existe un usuario con este email: " + email
            })
        }
    
        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(password, salt);

        const object = req.body;
        const usuario = new Usuario(object);
        usuario.password = cpassword;

        usuario.plan = calcularMacronutrientes(usuario.plan.tipo, usuario.plan.nivelActividad, usuario.sexo, usuario.pesoInicial, 
                                            usuario.altura, usuario.edad);

        // Establecemos los pesos historicos del usuario
        usuario.pesoHistorico.pesoMedio = usuario.pesoInicial;
        usuario.pesoHistorico.pesoMaximo = usuario.pesoInicial;
        usuario.pesoHistorico.pesoMinimo = usuario.pesoInicial;
        usuario.pesoActual = usuario.pesoInicial;

        await usuario.save();

        // Añadimos un primer registro de peso para el usuario 
        const registro = new RegistroPeso();
        registro.fecha = new Date();
        registro.peso = usuario.pesoInicial;
        registro.idUsuario = usuario._id;

        // Creamos unas medidas corporales por defecto
        await createMedidasCorporalesDefault(usuario._id);

        await registro.save();

        res.json({
            ok:true,
            msg:"createUser",
            usuario
        });
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok: false,
            msg:'Error creando usuario'
        })
    }
}

const updateUser = async(req, res = response) => {

    const { password, email, pesoInicial, pesoActual, pesoHistorico, plan, ...object } = req.body;
    const uid = req.params.id;

    try {
        const existeUsuario= await Usuario.findById(uid);
        // KO -> no existe el usuario
        if(!existeUsuario){
            return  res.status(400).json({
                ok:false,
                msg:'El usuario no existe'
            })
        }
    
        const existeEmail = await Usuario.findOne({ email });
    
        // KO -> existe un usuario con ese email
        if(existeEmail && existeEmail._id != uid) {
            return  res.status(400).json({
                ok: false,
                msg:"Ya existe un usuario con este email: " + email
            });
        }

        const sexo = object.sexo ? object.sexo : existeUsuario.sexo;
        const altura = object.altura ? object.altura : existeUsuario.altura;
        const edad = object.edad ? object.edad : existeUsuario.edad;
        object.plan = calcularMacronutrientes(plan.tipo, plan.nivelActividad, sexo, existeUsuario.pesoActual, altura, edad);
    
        object.email = email;
        const usuarioActualizado = await Usuario.findByIdAndUpdate(uid, object, { new: true }); 
    
        res.json({
            ok:true,
            msg:"updateUser",
            usuarioActualizado
        })
    } catch(error){
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg:'Error actualizando usuario'
        })
    }
}

const updatePassword = async(req, res = response) => {

    const uid = req.params.id;
    const { password, newPassword, newPassword2 } = req.body;

    try {

        const usuarioBD = await Usuario.findById(uid);
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Este usuario no existe',
            });
        }

        const validPassword = bcrypt.compareSync(password, usuarioBD.password);
        // Se comprueba que sabe la contraseña vieja y que ha puesto dos veces la contraseña nueva
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'La contraseña es incorrecta',
                token: ''
            });
        }

        if (newPassword !== newPassword2) {
            return res.status(400).json({
                ok: false,
                msg: 'Las contraseñas no coinciden',
            });
        }

        // tenemos todo OK, ciframos la nueva contraseña y la actualizamos
        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(newPassword, salt);
        usuarioBD.password = cpassword;

        // Almacenar en BD
        await usuarioBD.save();

        res.json({
            ok: true,
            msg: 'Contraseña actualizada'
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: 'Error al actualizar contraseña',
        });
    }


}

const deleteUser = async(req, res = response) => {
    const uid = req.params.id;

    try {

        const existeUsuario = await Usuario.findById(uid);

        // KO -> no existe el usuario
        if(!existeUsuario){
            return res.status(400).json({
                ok:false,
                msg:"El usuario no existe"
            });
        }

        const usuarioEliminado = await Usuario.findByIdAndDelete(uid);

        // Eliminamos todos los registros del resto de colecciones que esten relacionadas con este usuario
        await Alimento.deleteMany({ idUsuario: uid });
        await RegistroPeso.deleteMany({ idUsuario: uid });
        await Diario.deleteMany({ idUsuario: uid });
        await MedidaCorporal.deleteMany({ idUsuario: uid });
        await ActividadRealizada.deleteMany({ idUsuario: uid });
        await ActividadFisica.deleteMany({ idUsuario: uid });

        // OK
        res.json({
            ok:true,
            msg:"deleteUser",
            usuarioEliminado
        })

    } catch(error){
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error borrando usuario'
        })
    }
}

const calcularMacronutrientes = (tipoPlan, nivelActividad, sexo, peso, altura, edad) => {
    const plan = { tipo: tipoPlan, nivelActividad };

    // Calculamos la Tasa Metabolica Basal
    let tmb;
    if(sexo === SexoEnum.HOMBRE) {
        tmb = 10 * peso + 6.25 * altura - 5 * edad + 5;
    } else {
        tmb = 10 * peso + 6.25 * altura - 5 * edad - 161;
    }

    // Calculamos el nivel de actividad fisica
    let pal;
    switch(nivelActividad) {
        case NivelActividadEnum.SEDENTARIO:
            pal = 1.55;
            break;
        case NivelActividadEnum.MODERADO:
            pal = 1.85;
            break;
        case NivelActividadEnum.ALTO:
            pal = 2.2;
            break;
        default:
            pal = 2.4;
    }

    // Aqui obtenemos las calorias necesarias
    let caloriasDiarias = Math.trunc(tmb * pal);
    if(tipoPlan === PlanEnum.PERDER_PESO) {
        caloriasDiarias = caloriasDiarias - 500;
    } else if(tipoPlan === PlanEnum.GANAR_PESO) {
        caloriasDiarias = caloriasDiarias + 500;
    }

    // Calculamos las cantidades de cada macronutriente
    const proteinasDiarias = Math.trunc(2.5 * peso);
    const porcentajeGrasas = 30;
    const caloriasProteinas = 4 * proteinasDiarias;
    const caloriasGrasas = Math.trunc((porcentajeGrasas * caloriasDiarias)/100);
    const grasasDiarias = Math.trunc(caloriasGrasas/9);
    const caloriasCarbos = caloriasDiarias - (caloriasProteinas + caloriasGrasas);
    const carbosDiarios = Math.trunc(caloriasCarbos/4);

    plan.caloriasDiarias = caloriasDiarias;
    plan.proteinasDiarias = proteinasDiarias;
    plan.carbosDiarios = carbosDiarios;
    plan.grasasDiarias = grasasDiarias;

    return plan;
}

module.exports = {
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    updatePassword,
    deleteUser,
}