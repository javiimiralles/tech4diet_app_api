const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');

const {
    getDiarioById,
    getDiarioByUser,
    createDiario,
    updateDiario,
    updateAlimentosConsumidos,
    deleteDiario,
} = require('../controllers/diarios.controller');

const router = Router();

router.get('/:id', [
    validarJWT,
    check('id','El id del diario debe ser valido').isMongoId(),
    validarCampos
], getDiarioById);

router.get('/usuario/:idUsuario', [
    validarJWT,
    check('idUsuario','El idUsuario del usuario debe ser valido').isMongoId(),
    check('fecha','El argumento fecha es obligatorio').notEmpty(),
    check('fecha','El argumento fecha desde debe ser una fecha').isDate(),
    validarCampos
], getDiarioByUser);

router.post('/', [
    validarJWT,
    check('idUsuario','El id del usuario debe ser valido').isMongoId(),
    validarCampos
], createDiario);

router.put('/:id', [
    validarJWT,
    check('id','El id del diario debe ser valido').isMongoId(),
    check('aguaConsumida','El argumento aguaConsumida debe ser numérico').optional().isNumeric(),
    check('caloriasGastadas','El argumento caloriasGastadas debe ser numérico').optional().isNumeric(),
    check('idUsuario','El id del usuario debe ser valido').isMongoId(),
    validarCampos
], updateDiario);

router.put('/alimentos-consumidos/:id', [
    validarJWT,
    check('id','El id del diario debe ser valido').isMongoId(),
    check('idUsuario','El id del usuario debe ser valido').isMongoId(),
    validarCampos
], updateAlimentosConsumidos);

router.delete('/:id', [
    validarJWT,
    check('id','El id del diario debe ser valido').isMongoId(),
    validarCampos
], deleteDiario);

module.exports = router;