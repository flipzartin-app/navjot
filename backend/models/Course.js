const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  videoPublicId: { type: String },
  duration: { type: Number, default: 0 }, // seconds
  isPreview: { type: Boolean, default: false }, // free preview lesson
  order: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    tags: [{ type: String }],
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    price: { type: Number, required: true, default: 0 },
    discountPrice: { type: Number, default: 0 },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sections: [sectionSchema],
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    studentsCount: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false }, // admin approval gate
  },
  { timestamps: true }
);

courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', courseSchema);
