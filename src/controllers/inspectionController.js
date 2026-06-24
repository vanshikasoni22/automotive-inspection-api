const db = require('../config/db');
const cloudinary = require('../config/cloudinary');

// Create new inspection
const createInspection = async (req, res) => {
  const { part_name, notes } = req.body;
  const inspector_id = req.inspector.id;

  if (!req.file) {
    return res.status(400).json({ error: 'Part image is required' });
  }

  try {
    // Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'automotive-inspections' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const image_url = uploadResult.secure_url;

    // Save inspection record (AI fields empty for now, Phase 3 fills these)
    const result = await db.query(
      `INSERT INTO inspections 
        (inspector_id, part_name, image_url, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [inspector_id, part_name, image_url, notes]
    );

    res.status(201).json({
      message: 'Inspection created successfully',
      inspection: result.rows[0]
    });

  } catch (err) {
    console.error('Inspection error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all inspections for this inspector
const getInspections = async (req, res) => {
  const inspector_id = req.inspector.id;

  try {
    const result = await db.query(
      `SELECT * FROM inspections 
       WHERE inspector_id = $1 
       ORDER BY created_at DESC`,
      [inspector_id]
    );

    res.json({ inspections: result.rows });

  } catch (err) {
    console.error('Fetch error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single inspection
const getInspection = async (req, res) => {
  const { id } = req.params;
  const inspector_id = req.inspector.id;

  try {
    const result = await db.query(
      `SELECT * FROM inspections 
       WHERE id = $1 AND inspector_id = $2`,
      [id, inspector_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    res.json({ inspection: result.rows[0] });

  } catch (err) {
    console.error('Fetch error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createInspection, getInspections, getInspection };