const asyncHandler = require('express-async-handler');
const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc Get all published courses with search/filter/pagination
// @route GET /api/courses
const getCourses = asyncHandler(async (req, res) => {
  const { search, category, level, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

  const query = { isPublished: true, isApproved: true };

  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (level) query.level = level;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  if (sort === 'price_desc') sortOption = { price: -1 };
  if (sort === 'rating') sortOption = { ratingAverage: -1 };
  if (sort === 'popular') sortOption = { studentsCount: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [courses, total] = await Promise.all([
    Course.find(query)
      .populate('instructor', 'name avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .select('-sections'), // don't leak lesson video URLs in list view
    Course.countDocuments(query),
  ]);

  res.json({ courses, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @desc Get single course by slug (locked lessons unless enrolled/preview)
// @route GET /api/courses/:slug
const getCourseBySlug = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug }).populate('instructor', 'name avatar bio');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  let isEnrolled = false;
  if (req.user) {
    isEnrolled =
      req.user.enrolledCourses?.some((e) => e.course.toString() === course._id.toString()) ||
      req.user.role === 'admin' ||
      course.instructor._id.toString() === req.user._id.toString();
  }

  const courseObj = course.toObject();
  if (!isEnrolled) {
    courseObj.sections = courseObj.sections.map((sec) => ({
      ...sec,
      lessons: sec.lessons.map((l) => ({
        ...l,
        videoUrl: l.isPreview ? l.videoUrl : undefined,
      })),
    }));
  }

  res.json({ ...courseObj, isEnrolled });
});

// @desc Create course (instructor/admin)
// @route POST /api/courses
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, level, price, discountPrice, tags, thumbnail } = req.body;

  if (!title || !description || !category || price === undefined) {
    res.status(400);
    throw new Error('Missing required course fields');
  }

  let slug = slugify(title);
  const existing = await Course.findOne({ slug });
  if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  const course = await Course.create({
    title,
    slug,
    description,
    category,
    level,
    price,
    discountPrice,
    tags,
    thumbnail,
    instructor: req.user._id,
    sections: [],
  });

  res.status(201).json(course);
});

// @desc Update course (owner instructor or admin only)
// @route PUT /api/courses/:id
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this course');
  }

  const updatable = ['title', 'description', 'category', 'level', 'price', 'discountPrice', 'tags', 'thumbnail', 'isPublished'];
  updatable.forEach((field) => {
    if (req.body[field] !== undefined) course[field] = req.body[field];
  });

  // Editing a published course resets admin approval
  if (req.user.role !== 'admin') course.isApproved = false;

  await course.save();
  res.json(course);
});

// @desc Delete course
// @route DELETE /api/courses/:id
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this course');
  }
  await course.deleteOne();
  res.json({ message: 'Course deleted' });
});

// @desc Add a section+lesson to a course (owner instructor)
// @route POST /api/courses/:id/sections
const addSection = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const { title, lessons } = req.body;
  course.sections.push({ title, lessons: lessons || [] });
  await course.save();
  res.status(201).json(course);
});

// @desc Get courses belonging to the logged-in instructor
// @route GET /api/courses/instructor/mine
const getMyInstructorCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).sort({ createdAt: -1 });
  res.json(courses);
});

// @desc Get categories with course counts
// @route GET /api/courses/categories/list
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Course.aggregate([
    { $match: { isPublished: true, isApproved: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.json(categories);
});

// @desc Increment a lesson's view count (public - no auth required, matches public preview access)
// @route POST /api/courses/:id/lessons/:lessonId/view
const incrementLessonView = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  let lesson = null;
  for (const section of course.sections) {
    lesson = section.lessons.id(req.params.lessonId);
    if (lesson) break;
  }
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  lesson.views = (lesson.views || 0) + 1;
  await course.save();
  res.json({ views: lesson.views });
});

module.exports = {
  getCourses,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  addSection,
  getMyInstructorCourses,
  getCategories,
  incrementLessonView,
};
