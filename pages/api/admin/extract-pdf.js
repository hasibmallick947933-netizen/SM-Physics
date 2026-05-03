import { requireAdmin } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { base64 } = req.body;
  if (!base64) return res.status(400).json({ error: 'No file provided' });

  try {
    // Decode base64 to buffer
    const buffer = Buffer.from(base64, 'base64');
    const text = extractTextFromPdfBuffer(buffer);
    return res.status(200).json({ text: text || '' });
  } catch (err) {
    console.error('PDF extract error:', err);
    return res.status(500).json({ error: 'Could not extract text from PDF', text: '' });
  }
}

// Simple PDF text extractor — reads raw text streams from PDF
function extractTextFromPdfBuffer(buffer) {
  try {
    const content = buffer.toString('latin1');
    const textParts = [];

    // Extract text between BT (Begin Text) and ET (End Text) markers
    const btEtRegex = /BT([\s\S]*?)ET/g;
    let match;
    while ((match = btEtRegex.exec(content)) !== null) {
      const block = match[1];
      // Extract strings in parentheses (Tj and TJ operators)
      const strRegex = /\(([^)]*)\)\s*Tj/g;
      const arrRegex = /\[([^\]]*)\]\s*TJ/g;
      let sm;
      while ((sm = strRegex.exec(block)) !== null) {
        const cleaned = sm[1].replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\\(/g, '(').replace(/\\\)/g, ')');
        textParts.push(cleaned);
      }
      while ((sm = arrRegex.exec(block)) !== null) {
        const arrContent = sm[1];
        const innerStrings = arrContent.match(/\(([^)]*)\)/g) || [];
        innerStrings.forEach((s) => textParts.push(s.slice(1, -1)));
      }
    }

    const result = textParts.join(' ').replace(/\s+/g, ' ').trim();
    return result.length > 20 ? result : '';
  } catch {
    return '';
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
};

export default requireAdmin(handler);
