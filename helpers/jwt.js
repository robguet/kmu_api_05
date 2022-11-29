const jwt = require('jsonwebtoken');

const generateJWT = (uid) => {
	return new Promise((resolve, reject) => {
		const payload = { uid };
		jwt.sign(
			payload,
			'hola',
			// process.env.JWT_KEY,
			{
				expiresIn: '24h',
			},
			(err, token) => {
				if (err) {
					reject('No se pudo generar el token');
				} else {
					resolve(token);
				}
			}
		);
	});
};

// const comprobarjwt = (token = '') => {
// 	try {
// 		const { uid } = jwt.verify(token, 'hola');

// 		return [true, uid]
// 	} catch (error) {
// 		return [false, null]
// 	}
// };

module.exports = {
	generateJWT,
};
