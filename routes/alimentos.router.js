const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');

const {
    getAlimentoById,
    getAlimentosByUser,
    createAlimento,
    updateAlimento,
    deleteAlimento
} = require('../controllers/alimentos.controller');

const router= Router();

router.get('/:id', [
    validarJWT,
    check('id','El id del alimento debe ser valido').isMongoId(),
    validarCampos
], getAlimentoById);

router.get('/usuario/:idUsuario', [
    validarJWT,
    check('idUsuario','El idUsuario del alimento debe ser valido').isMongoId(),
    check('desde','El argumento desde debe ser numérico').optional().isNumeric(),
    check('resultados','El argumento desde debe ser numérico').optional().isNumeric(),
    validarCampos
], getAlimentosByUser);

router.post('/', [
    validarJWT,
    check('nombre','El argumento nombre es obligatorio').trim().not().isEmpty(),
    check('cantidadReferencia','El argumento cantidadReferencia es obligatorio').trim().not().isEmpty(),
    check('cantidadReferencia','El argumento cantidadReferencia debe ser numérico').isNumeric(),
    check('unidadMedida','El argumento unidadMedida es obligatorio').trim().not().isEmpty(),
    check('calorias','El argumento calorias es obligatorio').trim().not().isEmpty(),
    check('calorias','El argumento calorias debe ser numérico').isNumeric(),
    check('carbohidratos','El argumento carbohidratos es obligatorio').trim().not().isEmpty(),
    check('carbohidratos','El argumento carbohidratos debe ser numérico').isNumeric(),
    check('proteinas','El argumento proteinas es obligatorio').trim().not().isEmpty(),
    check('proteinas','El argumento proteinas debe ser numérico').isNumeric(),
    check('grasas','El argumento grasas es obligatorio').trim().not().isEmpty(),
    check('grasas','El argumento grasas debe ser numérico').isNumeric(),
    check('idUsuario','El id del usuario debe ser valido').isMongoId(),
    validarCampos
], createAlimento);

router.put('/:id', [
    validarJWT,
    check('nombre','El argumento nombre es obligatorio').trim().not().isEmpty(),
    check('cantidadReferencia','El argumento cantidadReferencia es obligatorio').trim().not().isEmpty(),
    check('cantidadReferencia','El argumento cantidadReferencia debe ser numérico').isNumeric(),
    check('unidadMedida','El argumento unidadMedida es obligatorio').trim().not().isEmpty(),
    check('calorias','El argumento calorias es obligatorio').trim().not().isEmpty(),
    check('calorias','El argumento calorias debe ser numérico').isNumeric(),
    check('carbohidratos','El argumento carbohidratos es obligatorio').trim().not().isEmpty(),
    check('carbohidratos','El argumento carbohidratos debe ser numérico').isNumeric(),
    check('proteinas','El argumento proteinas es obligatorio').trim().not().isEmpty(),
    check('proteinas','El argumento proteinas debe ser numérico').isNumeric(),
    check('grasas','El argumento grasas es obligatorio').trim().not().isEmpty(),
    check('grasas','El argumento grasas debe ser numérico').isNumeric(),
    check('idUsuario','El id del usuario debe ser valido').isMongoId(),
    validarCampos
], updateAlimento);

router.delete('/:id', [
    validarJWT,
    check('id','El id del alimento debe ser valido').isMongoId(),
    validarCampos
], deleteAlimento);

module.exports = router;