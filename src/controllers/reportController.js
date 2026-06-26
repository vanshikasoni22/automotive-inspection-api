const PDFDocument = require('pdfkit');
const db = require('../config/db');

const generateReport = async (req, res) => {
  const { id } = req.params;
  const inspector_id = req.inspector.id;

  try {
    // Get inspection
    const result = await db.query(
      `SELECT i.*, ins.name as inspector_name, ins.email as inspector_email
       FROM inspections i
       JOIN inspectors ins ON i.inspector_id = ins.id
       WHERE i.id = $1 AND i.inspector_id = $2`,
      [id, inspector_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    const inspection = result.rows[0];

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=inspection-${id}.pdf`
    );

    doc.pipe(res);

    // Header
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('INSPECTION REPORT', { align: 'center' });

    doc.moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666666')
      .text('AI-Based Automotive Parts Return Inspection System', {
        align: 'center',
      });

    doc.moveDown(1);

    // Divider
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor('#cccccc')
      .stroke();

    doc.moveDown(1);

    // Recommendation badge
    const rec = inspection.recommendation;
    const recColor =
      rec === 'accept' ? '#48BB78' :
      rec === 'reject' ? '#E53E3E' : '#ED8936';
    const recText =
      rec === 'accept' ? 'ACCEPTED' :
      rec === 'reject' ? 'REJECTED' : 'MANUAL REVIEW';

    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor(recColor)
      .text(recText, { align: 'center' });

    doc.moveDown(1);

    // Part details section
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('Part Details');

    doc.moveDown(0.5);

    const details = [
      ['Part Name', inspection.part_name || 'N/A'],
      ['Inspector', inspection.inspector_name],
      ['Email', inspection.inspector_email],
      ['Inspection Date', new Date(inspection.created_at).toLocaleString()],
      ['Notes', inspection.notes || 'None'],
    ];

    details.forEach(([label, value]) => {
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text(`${label}: `, { continued: true })
        .font('Helvetica')
        .fillColor('#555555')
        .text(value);
      doc.moveDown(0.3);
    });

    doc.moveDown(0.5);

    // Divider
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor('#cccccc')
      .stroke();

    doc.moveDown(1);

    // AI Analysis section
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('AI Analysis');

    doc.moveDown(0.5);

    const severityColor =
      inspection.severity === 'high' ? '#E53E3E' :
      inspection.severity === 'medium' ? '#ED8936' :
      inspection.severity === 'low' ? '#48BB78' : '#666666';

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#333333')
      .text('Severity: ', { continued: true })
      .fillColor(severityColor)
      .text((inspection.severity || 'N/A').toUpperCase());

    doc.moveDown(0.3);

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#333333')
      .text('Confidence Score: ', { continued: true })
      .font('Helvetica')
      .fillColor('#555555')
      .text(
        inspection.confidence_score
          ? `${Math.round(inspection.confidence_score * 100)}%`
          : 'N/A'
      );

    doc.moveDown(0.5);

    // Defects
    if (inspection.defects && inspection.defects.length > 0) {
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('Detected Defects:');

      doc.moveDown(0.3);

      inspection.defects.forEach((defect, index) => {
        doc
          .fontSize(11)
          .font('Helvetica')
          .fillColor('#555555')
          .text(
            `${index + 1}. ${defect.type} — Confidence: ${Math.round(defect.confidence * 100)}%`
          );
        doc.moveDown(0.2);
      });
    } else {
      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#555555')
        .text('No defects detected by AI.');
    }

    doc.moveDown(1);

    // Divider
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor('#cccccc')
      .stroke();

    doc.moveDown(1);

    // Image URL
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#333333')
      .text('Part Image: ', { continued: true })
      .font('Helvetica')
      .fillColor('#2563EB')
      .text(inspection.image_url, {
        link: inspection.image_url,
        underline: true,
      });

    doc.moveDown(2);

    // Footer
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#999999')
      .text(
        `Report generated on ${new Date().toLocaleString()} | Automotive Inspection System`,
        { align: 'center' }
      );

    doc.end();

  } catch (err) {
    console.error('Report error:', err.message);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

module.exports = { generateReport };