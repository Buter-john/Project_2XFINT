const express = require ('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', login);

router.get('/me', authMiddleware , (req , res) =>{
    res.json ({
        mmessage : ' tu es bien connecté ' , user : req.user 
    });
})

module.exports = router ; 