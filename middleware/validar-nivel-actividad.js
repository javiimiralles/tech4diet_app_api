const { response } = require("express");
const { NivelActividadEnum } = require("../enums/nivel-actividad.enum");

const validarNivelActividad = (req, res = response, next) => {
    const nivelActividad = req.body.plan.nivelActividad;
    
    if(!nivelActividad || !Object.values(NivelActividadEnum).includes(nivelActividad)){
        return res.status(400).json({
            ok: false,
            errores:'Nivel de actividad no permitido'
        });
    }
    next();
}

module.exports = { validarNivelActividad };