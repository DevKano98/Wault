const express = require('express');
const { z } = require('zod');

const auth = require('../middleware/auth');
const accessController = require('../controllers/access.controller');
const { validate } = require('../middleware/validate');

const router = express.Router();

const accessGrantSchema = z.object({
  vaultItemId: z.string().min(1),
  beneficiaryId: z.string().min(1),
});

router.get('/:id', accessController.getBeneficiaryAccess);

router.use(auth);
router.get('/', accessController.getGrants);
router.post('/', validate(accessGrantSchema), accessController.grantAccess);
router.post('/grant', validate(accessGrantSchema), accessController.grantAccess);
router.delete('/:id', accessController.revokeGrant);
router.delete('/grant/:id', accessController.revokeGrant);

module.exports = router;
