function createCrudController(Model, allowedFields) {
  function pick(body) {
    const data = {};
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) data[field] = body[field];
    });
    return data;
  }

  return {
    async create(req, res, next) {
      try {
        const record = await Model.create({
          ...pick(req.body),
          userId: req.user._id,
        });
        res.status(201).json({ record });
      } catch (err) {
        next(err);
      }
    },

    async list(req, res, next) {
      try {
        const records = await Model.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ records });
      } catch (err) {
        next(err);
      }
    },

    async getOne(req, res, next) {
      try {
        const record = await Model.findOne({ _id: req.params.id, userId: req.user._id });
        if (!record) return res.status(404).json({ error: 'Record not found' });
        res.json({ record });
      } catch (err) {
        next(err);
      }
    },

    async update(req, res, next) {
      try {
        const record = await Model.findOneAndUpdate(
          { _id: req.params.id, userId: req.user._id },
          { $set: pick(req.body) },
          { new: true, runValidators: true }
        );
        if (!record) return res.status(404).json({ error: 'Record not found' });
        res.json({ record });
      } catch (err) {
        next(err);
      }
    },

    async remove(req, res, next) {
      try {
        const record = await Model.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!record) return res.status(404).json({ error: 'Record not found' });
        res.json({ success: true });
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = createCrudController;
