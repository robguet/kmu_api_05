const jwt = require('jsonwebtoken');

const validarJWT = (req, res, next) => {
	try {
		const token = req.header('x-token');

		if (!token) {
			return res.status(401).json({
				ok: false,
				msg: 'No hay token',
			});
		}

		const { uid } = jwt.verify(token, 'hola');

		req.uid = uid;
		next();
	} catch (e) {
		res.status(401).json({
			ok: false,
			msj: 'Token no valido',
		});
	}
};

module.exports = {
	validarJWT,
};
