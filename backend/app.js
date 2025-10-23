import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import cors from "cors";

const app = express();
const PORT = 3000;
const MONGO_URL = "mongodb://mongo:27017/jpegpdf"; // Docker hostname for Mongo

app.use(cors());
app.use(express.json());

// ====== File Storage ======
const uploadDir = path.join("/app", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// ====== MongoDB ======
async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}

// ====== Routes ======
app.get("/", (req, res) => res.send("Backend is running 🚀"));

app.post("/convert", upload.array("images"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No images uploaded.");
    }

    console.log(`🖼️ Received ${req.files.length} image(s) for PDF conversion`);

    const pdfPath = path.join(uploadDir, `output_${Date.now()}.pdf`);
    const doc = new PDFDocument({ autoFirstPage: false });
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    for (const file of req.files) {
      const imgPath = file.path;
      const img = doc.openImage(fs.readFileSync(imgPath));
      const pageWidth = img.width;
      const pageHeight = img.height;

      doc.addPage({ size: [pageWidth, pageHeight] });
      doc.image(img, 0, 0, { width: pageWidth, height: pageHeight });
    }

    doc.end();

    writeStream.on("finish", () => {
      console.log(`✅ PDF generated successfully: ${pdfPath}`);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=converted.pdf"
      );

      res.sendFile(pdfPath, (err) => {
        if (err) {
          console.error("❌ Error sending file:", err);
          res.status(500).send("Error sending PDF");
        } else {
          console.log("📤 PDF sent to client successfully");
        }
      });
    });

    writeStream.on("error", (err) => {
      console.error("❌ Stream error:", err);
      res.status(500).send("Failed to generate PDF");
    });
  } catch (err) {
    console.error("❌ Error during conversion:", err);
    res.status(500).send("Server error during conversion");
  }
});

// ====== Start ======
connectMongo().then(() => {
  app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
});