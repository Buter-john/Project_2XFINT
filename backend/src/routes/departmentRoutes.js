const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment } = require('../controllers/departmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRole');

router.use(authMiddleware);
router.use(requireRole('RH'));

router.get('/', getDepartments);
router.post('/', createDepartment);

module.exports = router;