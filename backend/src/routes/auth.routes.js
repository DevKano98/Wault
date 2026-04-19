const express = require('express');

const auth = require('../middleware/auth');
const authController = require('../controllers/auth.controller');
const {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  validate,
} = require('../middleware/validate');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', auth, authController.me);
router.post('/password', auth, validate(changePasswordSchema), authController.changePassword);
router.delete('/account', auth, authController.deleteAccount);

module.exports = router;
