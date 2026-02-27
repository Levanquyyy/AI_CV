// utils/cvExtract.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParseLib = require("pdf-parse"); // ✅ nạp CJS an toàn trong ESM

import mammoth from "mammoth";
import axios from "axios";

export async function extractTextFromCloudinary(url, mimetypeHint = "") {
  try {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    const buf = Buffer.from(res.data);

    // PDF
    if (mimetypeHint.includes("pdf") || url.toLowerCase().endsWith(".pdf")) {
      // Support both old pdf-parse API (function) and new v2 API (PDFParse class)
      if (typeof pdfParseLib === "function") {
        const parsed = await pdfParseLib(buf);
        return parsed?.text || "";
      }

      if (pdfParseLib?.PDFParse) {
        const parser = new pdfParseLib.PDFParse({ data: buf });
        try {
          const parsed = await parser.getText();
          return parsed?.text || "";
        } finally {
          await parser.destroy?.();
        }
      }

      throw new Error("Unsupported pdf-parse API shape");
    }

    // DOCX
    if (
      mimetypeHint.includes(
        "vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) ||
      url.toLowerCase().endsWith(".docx")
    ) {
      const { value } = await mammoth.extractRawText({ buffer: buf });
      return value || "";
    }

    // DOC
    if (mimetypeHint.includes("msword") || url.toLowerCase().endsWith(".doc")) {
      throw new Error(
        "DOC format not supported directly. Please convert to PDF or DOCX first."
      );
    }

    throw new Error("Unsupported file type");
  } catch (error) {
    if (error.response) {
      // axios error
      throw new Error(`Fetch CV failed: HTTP ${error.response.status}`);
    }
    throw error;
  }
}
