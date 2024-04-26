const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');
const { getModelo3DById, getModelos3DByUser, subirModelo3D, deleteModelo3D } = require('../controllers/modelos3D.controller');
const router = Router();

router.get('/:id', [
    validarJWT,
    check('id', 'El id del modelo debe ser valido').isMongoId(),
    validarCampos
], getModelo3DById);

router.get('/usuario/:idUsuario', [
    validarJWT,
    check('idUsuario', 'El idUsuario del usuario debe ser valido').isMongoId(),
    validarCampos
], getModelos3DByUser);

router.post('/', [
    validarJWT,
    check('idUsuario', 'El idUsuario del usuario debe ser valido').isMongoId(),
    check('fecha', 'La fecha es obligatoria').notEmpty(),
    check('fecha', 'La fecha debe ser válida').isDate(),
    validarCampos,
], subirModelo3D);

router.delete('/:id', [
    validarJWT,
    check('id','El id del modelo 3D debe ser valido').isMongoId(),
    validarCampos
], deleteModelo3D);

module.exports = router;