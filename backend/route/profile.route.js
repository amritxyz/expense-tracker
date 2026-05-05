const router = require("express").Router();
const authenticate = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const {
  get_profile, update_profile, delete_profile,
  change_password,
  upload_avatar, get_avatar, remove_avatar,
} = require("../controller/profile.controller");

/* All routes require JWT except GET avatar (public)  */
router.get("/",               authenticate, get_profile);
router.put("/",               authenticate, update_profile);
router.delete("/",            authenticate, delete_profile);
router.put("/password",       authenticate, change_password);
router.post("/avatar",        authenticate, upload.single("avatar"), upload_avatar);
router.delete("/avatar",      authenticate, remove_avatar);
router.get("/avatar/:user_id",              get_avatar); /* Public */

module.exports = router;
