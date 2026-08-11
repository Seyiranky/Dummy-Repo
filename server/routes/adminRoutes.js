const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/users', verifyToken, authorize('admin'), adminController.listUsers);
router.get('/gigs', verifyToken, authorize('admin'), adminController.listGigs);
router.get('/flagged', verifyToken, authorize('admin'), adminController.listFlagged);
router.put('/gigs/:id/moderate', verifyToken, authorize('admin'), adminController.moderateGig);
router.put('/users/:id/moderate', verifyToken, authorize('admin'), adminController.moderateUser);

module.exports = router;
