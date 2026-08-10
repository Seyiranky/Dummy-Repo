const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', verifyToken, authorize('client'), matchController.createMatch);
router.get('/', verifyToken, matchController.listMatches);
router.put('/:id/status', verifyToken, matchController.updateMatchStatus);

module.exports = router;
