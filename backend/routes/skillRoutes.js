const express = require('express');
const Skill = require('../models/Skill');
const createCrudController = require('../controllers/crudControllerFactory');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const controller = createCrudController(Skill, [
  'name',
  'category',
  'proficiency',
  'issuer',
  'credentialUrl',
  'earnedDate',
]);

router.use(requireAuth);

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id', controller.getOne);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
