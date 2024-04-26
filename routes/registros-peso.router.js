const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');

const {
    getRegistroPesoById,
    getRegistrosPesoByUser,
    createRegistroPeso,
    updateRegistroPeso,
    deleteRegistroPeso
} = require('../controllers/registros-peso.controller');

const router = Router();

router.get('/:id', [
    validarJWT,
    check('id','El id del registro debe ser valido').isMongoId(),
    validarCampos
], getRegistroPesoById);

router.get('/usuario/:idUsuario', [
    validarJWT,
    check('idUsuario','El idUsuario del alimento debe ser valido').isMongoId(),
    check('desde','El argumento desde debe ser numérico').optional().isNumeric(),
    check('resultados','El argumento desde debe ser numérico').optional().isNumeric(),
    check('fechaDesde','El argumento fechaDesde desde debe ser una fecha').optional().isDate(),
    check('fechaHasta','El argumento fechaHasta desde debe ser una fecha').optional().isDate(),
    validarCampos
], getRegistrosPesoByUser);

router.post('/', [
    validarJWT,
    check('peso','El argumento peso es obligatorio').trim().not().isEmpty(),
    check('peso','El argumento peso debe ser numérico').isNumeric(),
    check('fecha','El argumento fecha es obligatorio').trim().not().isEmpty(),
    check('idUsuario','El id del usuario debe ser valido').isMongoId(),
    validarCampos
], createRegistroPeso);

router.put('/:id', [
    validarJWT,
    check('peso','El argumento peso es obligatorio').trim().not().isEmpty(),
    check('peso','El argumento peso debe ser numérico').isNumeric(),
    check('fecha','El argumento fecha es obligatorio').trim().not().isEmpty(),
    check('idUsuario','El id del usuario debe ser valido').isMongoId(),
    validarCampos
], updateRegistroPeso);

router.delete('/:id', [
    validarJWT,
    check('id','El id del registro debe ser valido').isMongoId(),
    validarCampos
], deleteRegistroPeso);

module.exports = router;