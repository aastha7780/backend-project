const router = require('express').Router();
const {
    registerUser,
    loginUser,
    updateUserDetails,
    getOneUser
} = require('../controllers/user.controller');
const verifyToken = require('../middleware/verifyToken');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.put('/update/:id', verifyToken, updateUserDetails);
router.get('/getone/:id', verifyToken, getOneUser);

module.exports = router;