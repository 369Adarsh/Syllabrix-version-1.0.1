const axios = require('axios');
const pdf = require('pdf-parse');

/**
 * Downloads a PDF from a URL and extracts its text content.
 * @param {string} url - The URL of the PDF file.
 * @returns {Promise<string>} - The extracted text.
 */
async function extractTextFromPdfUrl(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000 // 30s timeout for Cloudinary downloads
    });
    
    const buffer = Buffer.from(response.data);
    const data = await pdf(buffer);
    
    // Clean up text: remove multiple spaces and normalize newlines
    return data.text
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    console.error('PDF extraction failed:', error.message);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

module.exports = { extractTextFromPdfUrl };
