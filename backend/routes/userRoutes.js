const express = require("express");
const userController = require("../controllers/userController");
const { authenticateJWT } = require("../middleware/auth");
const zodValidator = require("../middleware/zodValidator");
const userSchema = require("../schemas/userSchema");
const verifyAccess = require("../middleware/verifyAccess");
const router = express.Router();

router.post("/login", userController.login);
router.post("/register", zodValidator(userSchema, "body"), userController.register);
router.get("/getusers", userController.getUsers);
router.put("/update/:id", authenticateJWT, verifyAccess("admin"), userController.updateUser);
router.delete("/delete/:id", authenticateJWT, verifyAccess("admin"), userController.deleteUser);

module.exports = router;
