const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')
const requireRole = require('../middlewares/requireRole')
const { approveRequest , rejectRequest } = require ('../controllers/validationController')

router.use(authMiddleware);

router.use(requireRole('MANAGER', 'RH'));

router.post('/:id/approve',approveRequest);
router.post('/:id/reject', rejectRequest);

module.exports = router;


