const express = require('express');

const auth = require('../middleware/auth');
const beneficiaryController = require('../controllers/beneficiary.controller');
const {
  beneficiarySchema,
  validate,
} = require('../middleware/validate');

const router = express.Router();

router.get('/verify/:token', beneficiaryController.verifyBeneficiary);

router.use(auth);
router.post('/', validate(beneficiarySchema), beneficiaryController.addBeneficiary);
router.get('/', beneficiaryController.getAll);
router.delete('/:id', beneficiaryController.removeBeneficiary);

module.exports = router;
