const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    institution: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
    },
    program: {
      type: String,
      trim: true,
    },
    degreeLevel: {
      type: String,
      enum: ['high_school', 'associate', 'bachelors', 'masters', 'doctorate', 'certificate', 'other'],
      default: 'bachelors',
    },
    startDate: { type: Date },
    endDate: { type: Date },
    gpa: { type: Number, min: 0, max: 10 },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

educationSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('EducationRecord', educationSchema);
