const express = require('express');
const CareerEvent = require('../models/CareerEvent');
const createCrudController = require('../controllers/crudControllerFactory');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const controller = createCrudController(CareerEvent, [
  'company',
  'role',
  'type',
  'status',
  'location',
  'startDate',
  'endDate',
]);

router.use(requireAuth);

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id', controller.getOne);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
