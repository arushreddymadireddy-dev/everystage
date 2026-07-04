const express = require('express');
const EducationRecord = require('../models/EducationRecord');
const Skill = require('../models/Skill');
const CareerEvent = require('../models/CareerEvent');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [education, skills, career] = await Promise.all([
      EducationRecord.find({ userId }).sort({ startDate: -1 }),
      Skill.find({ userId }).sort({ earnedDate: -1 }),
      CareerEvent.find({ userId }).sort({ startDate: -1 }),
    ]);

    res.json({
      user: req.user,
      education,
      skills,
      career,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
