const mongoose = require('mongoose');

const careerEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role/title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['internship', 'full_time', 'part_time', 'contract', 'offer'],
      default: 'full_time',
    },
    status: {
      type: String,
      enum: ['applied', 'interviewing', 'offered', 'accepted', 'rejected', 'current', 'past'],
      default: 'current',
    },
    location: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

careerEventSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('CareerEvent', careerEventSchema);
