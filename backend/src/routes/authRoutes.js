const express = require ('express');
const router = express.Router();
const { login, getMe, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', login);

router.get('/me', authMiddleware, getMe);

router.patch('/change-password' , authMiddleware , changePassword)



module.exports = router ; 