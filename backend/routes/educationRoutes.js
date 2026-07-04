const express = require('express');
const EducationRecord = require('../models/EducationRecord');
const createCrudController = require('../controllers/crudControllerFactory');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const controller = createCrudController(EducationRecord, [
  'institution',
  'program',
  'degreeLevel',
  'startDate',
  'endDate',
  'gpa',
  'status',
]);

router.use(requireAuth);

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id', controller.getOne);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
