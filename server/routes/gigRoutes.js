const express = require('express');
const router = express.Router();
const gigController = require('../controllers/gigController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', verifyToken, authorize('client'), gigController.createGig);
router.get('/', gigController.listGigs);
router.get('/:id', gigController.getGig);
router.get('/:id/candidates', verifyToken, authorize('client'), gigController.getCandidates);
router.put('/:id', verifyToken, authorize('client'), gigController.updateGig);

module.exports = router;
