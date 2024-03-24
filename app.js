const express = require("express");
const app = express();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
app.use("/uploads", express.static("uploads"));
var cors = require("cors");
app.use(cors());
const { PDFDocument } = require("pdf-lib");

// -----------------------DataBase-------------------------------
// const mongoUrl =
//   "mongodb+srv://sumeshpad1994:AthuSumesh%40123@cluster0.tsus0uh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// mongoose
//   .connect(mongoUrl, {
//     useNewUrlParser: true,
//   })
//   .then(() => {
//     console.log("Connected to database");
//   })
//   .catch((e) => console.log(e));

//-----------------Multer------------------
// Save Files on uploads folder on server
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

const port = 3000;

app.use(express.json());

// ----------------------API-------------------------------
app.get("/", (req, res) => res.send("Hello World!"));

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
   
    const pdfPath = req.file.path; //path of the pdf.
    const filename = req.file.filename;

    try {
      // Read the uploaded PDF file
      const data = fs.readFile(pdfPath, (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Error reading PDF file" });
        }

        // Convert PDF data to base64 to send to front end
        const base64Data = Buffer.from(data).toString("base64");

        // Send base64 data as JSON response with filename
        res.json({ filename: filename, pdfBase64: base64Data });
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Error reading PDF file" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// app.get("/get-files", async (req, res) => {
//   try {
//     const fileName = uploadFileName;
//     const data = await PdfSchema.findOne({ pdf: fileName });
//     res.json({ status: "OK", data: data });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

//-------------Create new pdf with selected pages uploaded file name and array.
app.post("/extract-pages", async (req, res) => {
  try {
    const { filename, pageNumbers } = req.body;

    // Read PDF file
    const pdfBytes = fs.readFileSync(filename);
    const outputDirectory = path.dirname(filename);
    const outputFilename = `extracted_pages.pdf`;
    const outputPath = path.resolve(outputDirectory, outputFilename);

    // Load PDF Document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const extractedDoc = await PDFDocument.create();

    // Copy specified pages to new document
    for (const pageNumber of pageNumbers) {
      const [copiedPage] = await extractedDoc.copyPages(pdfDoc, [
        pageNumber - 1,
      ]);
      extractedDoc.addPage(copiedPage);
    }

    // Save extracted pages to new PDF file
    const pdfBytesResult = await extractedDoc.save();
    fs.writeFileSync(outputPath, pdfBytesResult);

    // Send the new PDF file as response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${outputFilename}"`
    );
    res.setHeader("Content-Type", "application/pdf");

    res.sendFile(outputPath);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred during PDF extraction");
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
