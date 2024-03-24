const mongoose = require("mongoose");

const PdfDetailsSchema = new mongoose.Schema(
  {
    pdf: String,
    name: String,
  },
  { collection: "PdfDetails" }
);
mongoose.model("PdfDetails", PdfDetailsSchema);
