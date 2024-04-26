const { response } = require("express");
const { PlanEnum } = require("../enums/plan.enum");

const validarPlan = (req, res = response, next) => {
    const plan = req.body.plan.tipo;
    
    if(!plan || !Object.values(PlanEnum).includes(plan)){
        return res.status(400).json({
            ok: false,
            errores:'Plan no permitido'
        });
    }
    next();
}

module.exports = { validarPlan };