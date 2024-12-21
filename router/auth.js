const router = require("express").Router();

const { authenticate } = require("../middlewares/authenticate");

const { signUp, loginController, me, getRefreshToken, forgotPassword, setPassword } = require("../controller/auth");

router.post("/register", signUp);
router.post("/login", loginController);
router.get("/me", authenticate, me);
router.post('/refresh-token', getRefreshToken);
router.post('/forget-password', forgotPassword);
router.post('/reset-password', setPassword);

module.exports = router;
