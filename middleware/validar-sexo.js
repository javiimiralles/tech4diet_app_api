const { response } = require("express");
const { SexoEnum } = require("../enums/sexo.enum");

const validarSexo = (req, res = response, next) => {
    const sexo = req.body.sexo;
    
    if(!sexo || !Object.values(SexoEnum).includes(sexo)){
        return res.status(400).json({
            ok:false,
            errores:'Sexo no permitido'
        });
    }
    next();
}

module.exports = { validarSexo };