const router = require("express").Router();
const authRouter = require("./auth");
const home = require("../controller/home");
const { populate } = require("../controller/seederController");
const invitedUserRouter = require("./invitedUser");

router.use("/auth", authRouter);
router.use("/invite-user", invitedUserRouter);

router.get("/ping", home);
router.get("/populate", populate);


module.exports = router;
