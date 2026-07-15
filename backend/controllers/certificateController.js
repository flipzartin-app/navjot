const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Certificate = require('../models/Certificate');
const Progress = require('../models/Progress');

// @desc Issue certificate once course is 100% complete
// @route POST /api/certificates/:courseId
const issueCertificate = asyncHandler(async (req, res) => {
  const progress = await Progress.findOne({ user: req.user._id, course: req.params.courseId });
  if (!progress || progress.percentComplete < 100) {
    res.status(400);
    throw new Error('Course not yet completed - certificate not available');
  }

  let certificate = await Certificate.findOne({ user: req.user._id, course: req.params.courseId });
  if (!certificate) {
    const certificateId = `CERT-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    certificate = await Certificate.create({ user: req.user._id, course: req.params.courseId, certificateId });
  }

  res.json(certificate);
});

// @desc Verify a certificate by its public ID (public route)
// @route GET /api/certificates/verify/:certificateId
const verifyCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
    .populate('user', 'name')
    .populate('course', 'title');
  if (!certificate) {
    res.status(404);
    throw new Error('Certificate not found');
  }
  res.json(certificate);
});

module.exports = { issueCertificate, verifyCertificate };
