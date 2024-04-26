const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');
const { getArchivo } = require('../controllers/uploads.controller');

const router = Router();

router.get('/:fileName', [
    validarJWT,
    check('fileName','El fileName debe ser un nombre de archivo valido').trim().notEmpty(),
    validarCampos
], getArchivo);

module.exports = router;