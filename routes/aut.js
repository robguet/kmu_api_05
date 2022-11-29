const { Router } = require('express');
const { validarCampos } = require('../middlewares/validarCampos');
const { validarJWT, } = require('../middlewares/validar-jwt');
const autController = require('../controllers/autController');
const router = Router();

router.post(
    '/register',
    autController.signUp
)

router.post(
    '/login',
    autController.signIn
)

router.post(
    '/',
    autController.query
)

router.get('/newToken', validarJWT, autController.newToken);

router.post('/update/user/:id', autController.updateProfile);

router.post('/cutOff', autController.updateCutOffDate);

router.get('/message', autController.whatsapp);

module.exports = router;