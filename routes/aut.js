const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/fieldsValidator');
const { validateWT } = require('../middlewares/jwtValidator');
const autController = require('../controllers/authController');
const router = Router();

router.get(
    '/ok',
    autController.query
);

router.post(
    '/signup',
    [
        check('email', 'Email is mandatory').not().isEmpty(),
        check('email', 'Email not valid').isEmail(),
        check('password', 'Password not valid').isLength({ min: 5 }),
        validateFields
    ],
    autController.signUp
)

router.post(
    '/sigin',
    [
        check('email', 'Email is mandatory').not().isEmpty(),
        check('email', 'Email not valid').isEmail(),
        check('password', 'Password not valid').isLength({ min: 5 }),
        validateFields
    ],
    autController.signIn
)

router.get('/newToken', validateWT, autController.newToken);




module.exports = router;