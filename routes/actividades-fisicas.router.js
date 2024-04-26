const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');

const {
    getActividadFisicaById,
    getActividadesFisicas,
    createActividadFisica,
    updateActividadFisica,
    deleteActividadFisica
} = require('../controllers/actividades-fisicas.controller');

const router= Router();

router.get('/:id', [
    validarJWT,
    check('id','El id de la actividad debe ser valido').isMongoId(),
    validarCampos
], getActividadFisicaById);

router.get('/', [
    validarJWT,
    check('idUsuario','El idUsuario del alimento debe ser valido').optional().isMongoId(),
    check('desde','El argumento desde debe ser numérico').optional().isNumeric(),
    check('resultados','El argumento resultados debe ser numérico').optional().isNumeric(),
    validarCampos
], getActividadesFisicas);

router.post('/', [
    validarJWT,
    check('nombre','El argumento nombre es obligatorio').trim().not().isEmpty(),
    check('calorias','El argumento calorias es obligatorio').trim().not().isEmpty(),
    check('calorias','El argumento calorias debe ser numérico').isNumeric(),
    check('tiempoReferencia','El argumento tiempoReferencia es obligatorio').trim().not().isEmpty(),
    check('tiempoReferencia','El argumento tiempoReferencia debe ser numérico').isNumeric(),
    check('idUsuario','El id del usuario debe ser valido').isMongoId(),
    validarCampos
], createActividadFisica);

router.put('/:id', [
    validarJWT,
    check('id','El id de la actividad debe ser valido').isMongoId(),
    check('nombre','El argumento nombre es obligatorio').trim().not().isEmpty(),
    check('calorias','El argumento calorias es obligatorio').trim().not().isEmpty(),
    check('calorias','El argumento calorias debe ser numérico').isNumeric(),
    check('tiempoReferencia','El argumento tiempoReferencia es obligatorio').trim().not().isEmpty(),
    check('tiempoReferencia','El argumento tiempoReferencia debe ser numérico').isNumeric(),
    check('idUsuario','El id del usuario debe ser valido').isMongoId(),
    validarCampos
], updateActividadFisica);

router.delete('/:id', [
    validarJWT,
    check('id','El id de la actividad debe ser valido').isMongoId(),
    validarCampos
], deleteActividadFisica);

module.exports = router;