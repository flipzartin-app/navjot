const express = require('express');
const router = express.Router();
const { issueCertificate, verifyCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');

router.post('/:courseId', protect, issueCertificate);
router.get('/verify/:certificateId', verifyCertificate); // public verification

module.exports = router;
