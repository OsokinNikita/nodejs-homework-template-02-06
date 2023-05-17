
const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/postControllers");
const { validateBody, isValidId } = require("../../middlewares");
const { schemas } = require("../../models/contact");

router.get("/", ctrl.getAll);

router.get("/:contactId", isValidId, ctrl.getById);

router.post("/", validateBody(schemas.addSchema), ctrl.add);

router.put(
  "/:contactId",
  isValidId,
  validateBody(schemas.updateSchema),
  ctrl.updateById
);

router.patch(
  "/:contactId/favorite",
  isValidId,
  validateBody(schemas.updateFavoriteSchema),
  ctrl.updateFavorit
);

router.delete("/:contactId", isValidId, ctrl.removeById);

module.exports = router;
