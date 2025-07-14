// services/pdfGenerator.js
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateInvoicePDF({ user, template, formData }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  let y = height - 40;

  // Business Info
  page.drawText(user.businessName, {
    x: 50,
    y,
    size: 18,
    font,
    color: rgb(0, 0, 0),
  });
  y -= 20;
  page.drawText(user.businessAddress, { x: 50, y, size: 12, font });
  y -= 15;
  page.drawText(`Contact: ${user.businessContact}`, {
    x: 50,
    y,
    size: 12,
    font,
  });
  y -= 15;
  page.drawText(`GSTIN: ${user.gstNumber}`, { x: 50, y, size: 12, font });
  y -= 30;

  // Optional Logos
  if (template.logoUrl) {
    try {
      const imageBytes = await fetch(template.logoUrl).then((res) =>
        res.arrayBuffer()
      );
      const image = await pdfDoc.embedPng(imageBytes);
      page.drawImage(image, {
        x: width - 150,
        y: height - 100,
        width: 100,
        height: 50,
      });
    } catch (err) {
      console.warn("Failed to load logo:", err);
    }
  }

  // Form Fields
  page.drawText("Invoice Details:", {
    x: 50,
    y,
    size: 14,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= 20;

  template.fields.forEach((field, index) => {
    const value = formData[field.key] || "";
    page.drawText(`${field.label}: ${value}`, {
      x: 50,
      y: y - index * 20,
      size: 12,
      font,
    });
  });

  return await pdfDoc.save();
}
