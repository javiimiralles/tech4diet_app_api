const { response } = require('express');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario.model');
const { generarJWT } = require('../utils/jwt');
const jwt = require('jsonwebtoken');

const login = async(req, res = response) => {

    console.log(`Haciendo login con el usuario: ${req.body.email}`);

    const { email, password } = req.body;

    try {

        const usuarioBD = await Usuario.findOne({ email });
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        const passwordValida = bcrypt.compareSync(password, usuarioBD.password);
        if (!passwordValida) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        const { _id } = usuarioBD;
        const token = await generarJWT(usuarioBD._id);

        // OK -> login correcto
        res.json({
            ok: true,
            msg: 'Login correcto',
            uid: _id,
            token
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Ha ocurrido un error al iniciar sesión',
            token: ''
        });
    }
}

const renovarToken = async(req, res = response) => {

    console.log('Renovando token');

    const token = req.headers['x-token'];

    try {
        const { uid, ...object } = jwt.verify(token, process.env.JWTSECRET);

        const usuarioBD = await Usuario.findById(uid);

        if(!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'El token no es válido',
                token: ''
            });
        }

        const nuevoToken = await generarJWT(uid);

        // OK -> token creado
        res.json({
            ok: true,
            msg: 'Token',
            uid: uid,
            nombre: usuarioBD.nombre,
            email: usuarioBD.email,
            sexo: usuarioBD.sexo,
            altura: usuarioBD.altura,
            edad: usuarioBD.edad,
            pesoInicial: usuarioBD.pesoInicial,
            pesoObjetivo: usuarioBD.pesoObjetivo,
            pesoActual: usuarioBD.pesoActual,
            pesoHistorico: usuarioBD.pesoHistorico,
            plan: usuarioBD.plan,
            distribucionComidas: usuarioBD.distribucionComidas,
            configuracion: usuarioBD.configuracion,
            token: nuevoToken
        });

    } catch {
        return res.status(400).json({
            ok: false,
            msg: 'El token no es válido',
            token: ''
        });
    }
}

module.exports = { login, renovarToken };