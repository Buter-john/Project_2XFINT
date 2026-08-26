const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment } = require('../controllers/departmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRole');

router.use(authMiddleware);

router.get('/', getDepartments);
router.post('/', requireRole('RH'), createDepartment);

module.exports = router;