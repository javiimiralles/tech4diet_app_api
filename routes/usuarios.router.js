const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');
const { validarSexo } = require('../middleware/validar-sexo');
const { validarPlan } = require('../middleware/validar-plan');
const { validarNivelActividad } = require('../middleware/validar-nivel-actividad');

const {
    getUserById,
    getUserByEmail,
    createUser, 
    updateUser,
    updatePassword,
    deleteUser
} = require('../controllers/usuarios.controller');

const router= Router();

router.get('/:id', [
    validarJWT,
    check('id','El id de usuario debe ser valido').isMongoId(),
    validarCampos,
], getUserById);

router.get('/email/:email', [
    check('email','El argumento email es obligatorio').not().isEmpty(),
    check('email','El email es incorrecto').isEmail(),
    validarCampos,
], getUserByEmail);

router.post('/',[
    // validarJWT,
    check('nombre','El argumento nombre es obligatorio').trim().not().isEmpty(),
    check('email','El argumento email es obligatorio').trim().not().isEmpty(),
    check('email','El argumento email debe ser un email').isEmail(),
    check('password','El argumento password es obligatorio').trim().not().isEmpty(),
    check('sexo','El argumento sexo es obligatorio').trim().not().isEmpty(),
    check('altura','El argumento altura es obligatorio').trim().not().isEmpty(),
    check('altura','El argumento altura debe ser numérico').isNumeric(),
    check('edad','El argumento edad es obligatorio').trim().not().isEmpty(),
    check('edad','El argumento edad debe ser numérico').isNumeric(),
    check('pesoInicial','El argumento pesoInicial es obligatorio').trim().not().isEmpty(),
    check('pesoInicial','El argumento pesoInicial debe ser numérico').isNumeric(),
    check('plan.tipo','El argumento plan.tipo es obligatorio').trim().not().isEmpty(),
    validarCampos,
    validarPlan,
    validarSexo,
    validarNivelActividad,
], createUser);

router.put('/:id', [
    validarJWT,
    check('id','El identificador no es válido').isMongoId(),
    check('nombre','El argumento nombre es obligatorio').trim().not().isEmpty(),
    check('email','El argumento email es obligatorio').trim().not().isEmpty(),
    check('email','El argumento email debe ser un email').isEmail(),
    check('sexo','El argumento sexo es obligatorio').trim().not().isEmpty(),
    check('altura','El argumento altura es obligatorio').trim().not().isEmpty(),
    check('altura','El argumento altura debe ser numérico').isNumeric(),
    check('edad','El argumento edad es obligatorio').trim().not().isEmpty(),
    check('edad','El argumento edad debe ser numérico').isNumeric(),
    check('plan.tipo','El argumento plan.tipo es obligatorio').trim().not().isEmpty(),
    validarCampos,
    validarPlan,
    validarSexo,
    validarNivelActividad,
], updateUser);

router.put('/change-password/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    check('password', 'El argumento password es obligatorio').not().isEmpty().trim(),
    check('newPassword', 'El argumento nuevopassword es obligatorio').not().isEmpty().trim(),
    check('newPassword2', 'El argumento nuevopassword2 es obligatorio').not().isEmpty().trim(),
    validarCampos,
], updatePassword);

router.delete('/:id', [
    validarJWT,
    check('id','el identificador no es válido').isMongoId(),
    validarCampos
], deleteUser);

module.exports = router;