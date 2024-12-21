const router = require("express").Router();
const authRouter = require("./auth");
const home = require("../controller/home");

router.use("/auth", authRouter);

router.get("/ping", home);


module.exports = router;
