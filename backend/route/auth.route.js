const router = require("express").Router();
const { register, login } = require("../controller/auth.controller");

/* POST /auth/register */
router.post("/register", register);

/* POST /auth/login */
router.post("/login", login);

module.exports = router;
