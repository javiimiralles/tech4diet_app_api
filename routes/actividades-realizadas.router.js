const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');

const {
    getActividadRealizadaById,
    getActividadesRealizadasByUser,
    createActividadRealizada,
    updateActividadRealizada,
    deleteActividadRealizada
} = require('../controllers/actividades-realizadas.controller');

const router= Router();

router.get('/:id', [
    validarJWT,
    check('id','El id de la actividad debe ser valido').isMongoId(),
    validarCampos
], getActividadRealizadaById);

router.get('/usuario/:idUsuario', [
    validarJWT,
    check('idUsuario','El idUsuario del alimento debe ser valido').isMongoId(),
    check('fecha','El argumento fecha es obligatorio').notEmpty(),
    check('fecha','El argumento fecha desde debe ser una fecha').isDate(),
    validarCampos
], getActividadesRealizadasByUser);

router.post('/', [
    validarJWT,
    check('fecha','El argumento fecha es obligatorio').notEmpty(),
    check('caloriasGastadas','El argumento caloriasGastadas es obligatorio').trim().not().isEmpty(),
    check('caloriasGastadas','El argumento caloriasGastadas debe ser numérico').isNumeric(),
    check('duracion','El argumento duracion es obligatorio').trim().not().isEmpty(),
    check('duracion','El argumento duracion debe ser numérico').isNumeric(),
    check('idActividadFisica','El id de la actividad física debe ser valido').isMongoId(),
    check('idUsuario','El id del usuario debe ser valido').isMongoId(),
    validarCampos
], createActividadRealizada);

router.put('/:id', [
    validarJWT,
    check('id','El id de la actividad debe ser valido').isMongoId(),
    check('fecha','El argumento fecha es obligatorio').notEmpty(),
    check('caloriasGastadas','El argumento caloriasGastadas es obligatorio').trim().not().isEmpty(),
    check('caloriasGastadas','El argumento caloriasGastadas debe ser numérico').isNumeric(),
    check('duracion','El argumento duracion es obligatorio').trim().not().isEmpty(),
    check('duracion','El argumento duracion debe ser numérico').isNumeric(),
    check('idActividadFisica','El id de la actividad física debe ser valido').isMongoId(),
    check('idUsuario','El id del usuario debe ser valido').isMongoId(),
    validarCampos
], updateActividadRealizada);

router.delete('/:id', [
    validarJWT,
    check('id','El id de la actividad debe ser valido').isMongoId(),
    validarCampos
], deleteActividadRealizada);

module.exports = router;