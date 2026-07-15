const Course = require('../models/Course');

const computeCartTotal = async (courseIds) => {
  const courses = await Course.find({ _id: { $in: courseIds } });
  if (courses.length !== courseIds.length) {
    throw new Error('One or more courses in cart no longer exist');
  }
  const items = courses.map((c) => ({ course: c._id, price: c.discountPrice > 0 ? c.discountPrice : c.price }));
  const total = items.reduce((sum, i) => sum + i.price, 0);
  return { items, total, courses };
};

module.exports = { computeCartTotal };
