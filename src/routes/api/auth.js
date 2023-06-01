/** @format */

const express = require("express");
const ctrl = require("../../controllers/auth");
const { schemas } = require("../../models/user");
const {
  validateBody,
  authenticate,
  validationParams,
} = require("../../middlewares");
const router = express.Router();

// singup
router.post("/register", validateBody(schemas.registerSchema), ctrl.register);

// singin
router.post("/login", validateBody(schemas.loginSchema), ctrl.login);

router.get("/current", authenticate, ctrl.getCurrent);

router.get("/logout", authenticate, ctrl.logout);

router.patch(
  "/",
  authenticate,
  validateBody(schemas.subscriptionSchema),
  validationParams(schemas.verifyMongoIdSchema),
  ctrl.updateSubscription
);

module.exports = router;
