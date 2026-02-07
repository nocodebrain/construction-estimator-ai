import * as pdfParse from 'pdf-parse';

/**
 * Extract text from PDF buffer
 */
export async function extractPDFText(buffer: Buffer): Promise<string> {
  try {
    // @ts-ignore - pdf-parse has export issues with TypeScript/ESM
    const pdf = pdfParse.default || pdfParse;
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF');
  }
}

/**
 * Simple quantity extraction from text
 * Looks for patterns like:
 * - "100 m2" or "100m2"
 * - "50 metres" or "50 meters"
 * - "25 each"
 * - "Door x 10"
 */
export interface ExtractedQuantity {
  text: string;       // Original text snippet
  amount: number;     // Parsed quantity
  unit: string;       // Unit (m2, m, each, etc.)
  description: string; // Surrounding context
  confidence: number;  // 0-1 confidence score
}

export function extractQuantitiesFromText(text: string): ExtractedQuantity[] {
  const quantities: ExtractedQuantity[] = [];

  // Normalize text
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Pattern 1: "100 m2" or "100m2"
  const areaPattern = /(\d+(?:\.\d+)?)\s*(m2|m²|sqm|square\s*meters?)/gi;

  // Pattern 2: "50 m" or "50 metres"
  const lengthPattern = /(\d+(?:\.\d+)?)\s*(m|metres?|meters?|linear\s*metres?)/gi;

  // Pattern 3: "25 each" or "x 25"
  const countPattern = /(?:x\s*)?(\d+)\s*(?:each|no\.|number|qty|quantity|units?)/gi;

  // Pattern 4: Door/window counts "Door x 10"
  const itemCountPattern = /(door|window|toilet|basin|light|power\s*point|data\s*point)\s*(?:x\s*)?(\d+)/gi;

  lines.forEach((line, lineIndex) => {
    // Check each pattern
    let match;

    // Area
    while ((match = areaPattern.exec(line)) !== null) {
      quantities.push({
        text: match[0],
        amount: parseFloat(match[1]),
        unit: 'm2',
        description: line,
        confidence: 0.9,
      });
    }

    // Length
    while ((match = lengthPattern.exec(line)) !== null) {
      quantities.push({
        text: match[0],
        amount: parseFloat(match[1]),
        unit: 'm',
        description: line,
        confidence: 0.85,
      });
    }

    // Count
    while ((match = countPattern.exec(line)) !== null) {
      quantities.push({
        text: match[0],
        amount: parseInt(match[1]),
        unit: 'each',
        description: line,
        confidence: 0.8,
      });
    }

    // Item count
    while ((match = itemCountPattern.exec(line)) !== null) {
      quantities.push({
        text: match[0],
        amount: parseInt(match[2]),
        unit: 'each',
        description: `${match[1]} ${line}`,
        confidence: 0.75,
      });
    }
  });

  // Remove duplicates (same line, same amount)
  const unique = quantities.filter((q, index, self) =>
    index === self.findIndex(t => 
      t.amount === q.amount && t.unit === q.unit && t.description === q.description
    )
  );

  return unique;
}

/**
 * Categorize quantity based on description keywords
 */
export function categorizeQuantity(description: string): string {
  const lower = description.toLowerCase();

  if (lower.includes('wall') || lower.includes('partition') || lower.includes('plaster')) {
    return 'WALLS';
  }
  if (lower.includes('floor') || lower.includes('carpet') || lower.includes('tile') || lower.includes('vinyl')) {
    return 'FLOORS';
  }
  if (lower.includes('ceiling')) {
    return 'CEILINGS';
  }
  if (lower.includes('door')) {
    return 'DOORS';
  }
  if (lower.includes('window')) {
    return 'WINDOWS';
  }
  if (lower.includes('power') || lower.includes('light') || lower.includes('electrical') || lower.includes('data')) {
    return 'ELECTRICAL';
  }
  if (lower.includes('plumb') || lower.includes('toilet') || lower.includes('basin') || lower.includes('sink')) {
    return 'PLUMBING';
  }
  if (lower.includes('hvac') || lower.includes('air con') || lower.includes('ac ') || lower.includes('ducted')) {
    return 'HVAC';
  }
  if (lower.includes('paint') || lower.includes('finish') || lower.includes('skirting')) {
    return 'FINISHES';
  }

  return 'OTHER';
}
