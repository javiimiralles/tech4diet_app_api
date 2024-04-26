const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');

const {
    getFotoProgresoById,
    getFotosProgresoByUser,
    uploadFotoProgreso,
    deleteFotoProgreso
} = require('../controllers/fotos_progreso.controller');

const router= Router();

router.get('/:id', [
    validarJWT,
    check('id','El id de la foto del progreso debe ser valido').isMongoId(),
    validarCampos
], getFotoProgresoById);

router.get('/usuario/:idUsuario', [
    validarJWT,
    check('idUsuario','El idUsuario debe ser valido').isMongoId(),
    validarCampos
], getFotosProgresoByUser);

router.post('/', [
    validarJWT,
    check('idUsuario','El idUsuario debe ser valido').isMongoId(),
    validarCampos
], uploadFotoProgreso);

router.delete('/:id', [
    validarJWT,
    check('id','El id de la foto del progreso debe ser valido').isMongoId(),
    validarCampos
], deleteFotoProgreso);

module.exports = router;