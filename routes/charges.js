const { Router } = require('express');
const { getChargesByPaymentMethod, createCharge, getChargeByUser, getChargesByCategory, getListCharges, payCreditCard } = require('../controllers/chargesController');
const router = Router();

router.post(
    '/new',
    createCharge
);

router.post(
    '/:id/get',
    getChargeByUser
);

router.post(
    '/:id/get/:category',
    getChargesByCategory
);

router.post(
    '/:id/get/byPaymentMethod/:method',
    getChargesByPaymentMethod
);


router.get(
    '/get/CategoriesList',
    getListCharges
);

router.post(
    '/make/payment',
    payCreditCard
)

module.exports = router;