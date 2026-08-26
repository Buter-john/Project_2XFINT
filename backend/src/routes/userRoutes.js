const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')
const requireRole = require('../middlewares/requireRole')
const { getUsers , createUser , toggleUserActive, updateUser , resetPassword} = require ("../controllers/userController")


router.use(authMiddleware);
router.use(requireRole('RH'));

router.get('/', getUsers); 
router.post('/', createUser);
router.put('/:id', updateUser)
router.patch('/:id/toggle-active', toggleUserActive);
router.post('/:id/reset-password', resetPassword);

module.exports = router;