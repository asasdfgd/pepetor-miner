const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const cacheMiddleware = require('../middleware/cacheMiddleware');

router.get('/', cacheMiddleware('users', 30), userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
