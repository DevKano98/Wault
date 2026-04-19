const express = require('express');
const multer = require('multer');

const auth = require('../middleware/auth');
const vaultController = require('../controllers/vault.controller');
const { validate, vaultItemSchema } = require('../middleware/validate');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(auth);
router.get('/', vaultController.getAll);
router.post('/', upload.single('file'), validate(vaultItemSchema), vaultController.create);
router.get('/:id', vaultController.getOne);
router.put('/:id', upload.single('file'), vaultController.update);
router.delete('/:id', vaultController.delete);

module.exports = router;
