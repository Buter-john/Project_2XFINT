const express = require('express');
const { createRequest , getMyRequests , updateRequest , cancelRequest, getPendingRequest } = require('../controllers/requestController');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require ('../middlewares/requireRole')

router.use(authMiddleware);

router.get ('/pending' , requireRole('MANAGER', 'RH') , getPendingRequest)

router.post ('/', createRequest);

router.put ('/:id', updateRequest);

router.delete('/:id', cancelRequest);

router.get('/', getMyRequests);

module.exports = router; 

