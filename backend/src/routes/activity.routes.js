const express = require('express');

const auth = require('../middleware/auth');
const activityController = require('../controllers/activity.controller');
const {
  inactivityRuleSchema,
  validate,
} = require('../middleware/validate');

const router = express.Router();

router.get('/ping', activityController.ping);
router.post('/ping', activityController.ping);

router.use(auth);
router.get('/risk', activityController.getRiskScore);
router.get('/rule', activityController.getRule);
router.get('/log', activityController.getLog);
router.post('/rule', validate(inactivityRuleSchema), activityController.setRule);
router.put('/rule', validate(inactivityRuleSchema), activityController.setRule);

module.exports = router;
