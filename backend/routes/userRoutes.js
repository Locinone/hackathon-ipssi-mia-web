const express = require("express");
const userController = require("../controllers/userController");
const { authenticateJWT } = require("../middleware/auth");

const router = express.Router();

router.post("/login", userController.login);
router.post("/register", userController.register);
router.get("/getusers", userController.getUsers);
router.put("/update/:id", authenticateJWT, userController.updateUser);
router.delete("/delete/:id", authenticateJWT, userController.deleteUser);

module.exports = router;
