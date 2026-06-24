const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/authMiddleware');
const {
  createInspection,
  getInspections,
  getInspection
} = require('../controllers/inspectionController');

// Multer stores file in memory before Cloudinary upload
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', auth, upload.single('image'), createInspection);
router.get('/', auth, getInspections);
router.get('/:id', auth, getInspection);

module.exports = router;