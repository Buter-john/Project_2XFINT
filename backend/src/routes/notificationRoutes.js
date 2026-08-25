const express = require('express')
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware')
const { getMyNotifications , markAsRead } = require('../controllers/notificationController')


router.use(authMiddleware);

router.get('/', getMyNotifications);

router.patch ('/:id/read', markAsRead );

module.exports = router;