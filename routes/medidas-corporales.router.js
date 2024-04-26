const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');

const {
    getMedidaCorporalById,
    getMedidasCorporalesByUser,
    createMedidaCorporal,
    updateMedidaCorporal,
    deleteMedidaCorporal
} = require('../controllers/medidas-corporales.controller');

const router= Router();

router.get('/:id', [
    validarJWT,
    check('id','El id de la medida corporal debe ser valido').isMongoId(),
    validarCampos
], getMedidaCorporalById);

router.get('/usuario/:idUsuario', [
    validarJWT,
    check('idUsuario','El idUsuario debe ser valido').isMongoId(),
    validarCampos
], getMedidasCorporalesByUser);

router.post('/', [
    validarJWT,
    check('nombre','El argumento nombre es obligatorio').trim().not().isEmpty(),
    check('bilateral','El argumento bilateral es obligatorio').isBoolean(),
    check('idUsuario','El id del usuario debe ser valido').isMongoId(),
    validarCampos
], createMedidaCorporal);

router.put('/:id', [
    validarJWT,
    check('idUsuario','El id del usuario debe ser valido').isMongoId(),
    validarCampos
], updateMedidaCorporal);

router.delete('/:id', [
    validarJWT,
    check('id','El id de la medida corporal debe ser valido').isMongoId(),
    validarCampos
], deleteMedidaCorporal);

module.exports = router;
