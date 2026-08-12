const express = require('express');
const { createRequest , getMyRequests , updateRequest , cancelRequest } = require('../controllers/requestController');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post ('/', createRequest);

router.put ('/:id', updateRequest);

router.delete('/:id', cancelRequest);

router.get('/', getMyRequests);

module.exports = router; 

