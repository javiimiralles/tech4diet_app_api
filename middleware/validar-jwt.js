const jwt = require('jsonwebtoken');

const validarJWT = (req, res, next) => {

    const token = req.header('x-token') || req.query.token;

    if (!token) {
        return res.status(400).json({
            ok: false,
            msg: 'Falta token de autorización'
        });
    }

    try {
        const { uid, ...object } = jwt.verify(token, process.env.JWTSECRET);

        req.uidToken = uid;
        next();

    } catch (err) {
        return res.status(400).json({
            ok: false,
            msg: 'Token no válido'
        })
    }
}

module.exports = { validarJWT }