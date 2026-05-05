const router = require("express").Router();
const { create, get_all, update, remove } = require("../controller/expense.controller");
const authenticate = require("../middleware/auth.middleware");

/* All expense routes require JWT */
router.use(authenticate);

router.post("/",    create);
router.get("/",     get_all);
router.put("/:id",  update);
router.delete("/:id", remove);

module.exports = router;
