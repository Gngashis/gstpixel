import { ExtractedGstInvoice, ParsedInvoiceLineItem } from './types';
import { extractStateCodeFromGstin } from './gst-verification';

export function parseGstInvoiceFromMarkdown(text: string): ExtractedGstInvoice {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  let supplierGstin: string | undefined;
  let recipientGstin: string | undefined;
  let supplierName: string | undefined;
  let recipientName: string | undefined;
  let invoiceNumber: string | undefined;
  let invoiceDate: string | undefined;
  let placeOfSupplyState: string | undefined;

  let declaredTaxableValue = 0;
  let declaredCgst = 0;
  let declaredSgst = 0;
  let declaredIgst = 0;
  let declaredGrandTotal = 0;

  // 1. Scan for GSTINs (15 alphanumeric characters)
  const gstinRegex = /\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/g;
  const foundGstins: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = gstinRegex.exec(text)) !== null) {
    if (!foundGstins.includes(match[1])) {
      foundGstins.push(match[1]);
    }
  }

  if (foundGstins.length > 0) {
    supplierGstin = foundGstins[0];
  }
  if (foundGstins.length > 1) {
    recipientGstin = foundGstins[1];
  }

  // PASS 1: Extract all document headers and summary declared numbers
  for (const line of lines) {
    // Invoice number
    if (!invoiceNumber && /invoice\s*(?:no|num|number|#)?[:\s]+([A-Za-z0-9\/-]+)/i.test(line)) {
      const m = line.match(/invoice\s*(?:no|num|number|#)?[:\s]+([A-Za-z0-9\/-]+)/i);
      if (m && m[1].length >= 2) invoiceNumber = m[1].trim();
    }

    // Invoice date
    if (!invoiceDate && /(?:invoice\s*)?date[:\s]+([0-9]{1,4}[-\/\.][0-9]{1,2}[-\/\.][0-9]{1,4})/i.test(line)) {
      const m = line.match(/(?:invoice\s*)?date[:\s]+([0-9]{1,4}[-\/\.][0-9]{1,2}[-\/\.][0-9]{1,4})/i);
      if (m) invoiceDate = m[1].trim();
    }

    // Place of Supply
    if (!placeOfSupplyState && /(?:place\s*of\s*supply|pos)[:\s]+(?:state\s*code\s*)?([0-9]{2}|[A-Za-z\s]+)/i.test(line)) {
      const m = line.match(/(?:place\s*of\s*supply|pos)[:\s]+(?:state\s*code\s*)?([0-9]{2}|[A-Za-z\s]+)/i);
      if (m) placeOfSupplyState = m[1].trim().slice(0, 2);
    }

    // Taxable Value
    if (/(?:total\s*)?taxable\s*(?:value|amount)?[:\s]+(?:₹|rs\.?)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i.test(line)) {
      const m = line.match(/(?:total\s*)?taxable\s*(?:value|amount)?[:\s]+(?:₹|rs\.?)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
      if (m) declaredTaxableValue = parseFloat(m[1]);
    }

    // CGST
    if (/cgst(?:\s*amount)?[:\s]+(?:₹|rs\.?)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i.test(line)) {
      const m = line.match(/cgst(?:\s*amount)?[:\s]+(?:₹|rs\.?)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
      if (m) declaredCgst = parseFloat(m[1]);
    }

    // SGST / UTGST
    if (/(?:sgst|utgst)(?:\s*amount)?[:\s]+(?:₹|rs\.?)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i.test(line)) {
      const m = line.match(/(?:sgst|utgst)(?:\s*amount)?[:\s]+(?:₹|rs\.?)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
      if (m) declaredSgst = parseFloat(m[1]);
    }

    // IGST
    if (/igst(?:\s*amount)?[:\s]+(?:₹|rs\.?)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i.test(line)) {
      const m = line.match(/igst(?:\s*amount)?[:\s]+(?:₹|rs\.?)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
      if (m) declaredIgst = parseFloat(m[1]);
    }

    // Grand Total
    if (/(?:grand\s*total|invoice\s*total|total\s*amount)[:\s]+(?:₹|rs\.?)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i.test(line)) {
      const m = line.match(/(?:grand\s*total|invoice\s*total|total\s*amount)[:\s]+(?:₹|rs\.?)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
      if (m) declaredGrandTotal = parseFloat(m[1]);
    }
  }

  const supplierState = extractStateCodeFromGstin(supplierGstin);
  const pos = placeOfSupplyState || (recipientGstin ? extractStateCodeFromGstin(recipientGstin) || undefined : undefined);
  const isIntraState = Boolean(supplierState && pos && supplierState === pos) || (declaredCgst > 0 || declaredSgst > 0);

  // PASS 2: Parse table rows using known summary context
  const lineItems: ParsedInvoiceLineItem[] = [];

  for (const line of lines) {
    if (line.startsWith('|') && line.endsWith('|')) {
      const cols = line.split('|').map((c) => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      // Skip header and separator rows
      if (cols.length >= 2 && !cols.some((c) => /^[-:]+$/.test(c)) && !cols.some((c) => /description|item|particulars|taxable/i.test(c))) {
        const desc = cols[0] || 'Item';
        const numValues = cols.map((c) => parseFloat(c.replace(/[^0-9\.]/g, ''))).filter((n) => !isNaN(n));

        if (numValues.length >= 2) {
          const taxable = numValues[numValues.length - 2] || numValues[0];
          const total = numValues[numValues.length - 1] || taxable;
          const taxDelta = Math.max(0, total - taxable);
          const rateEst = taxable > 0 ? Math.round((taxDelta / taxable) * 100) : 18;

          let cgst = 0;
          let sgst = 0;
          let igst = 0;

          if (isIntraState) {
            cgst = Math.round((taxDelta / 2) * 100) / 100;
            sgst = Math.round((taxDelta / 2) * 100) / 100;
          } else {
            igst = Math.round(taxDelta * 100) / 100;
          }

          lineItems.push({
            description: desc,
            taxableValue: taxable,
            gstRate: rateEst > 0 ? rateEst : 18,
            totalAmount: total,
            cgstAmount: cgst,
            sgstAmount: sgst,
            igstAmount: igst,
          });
        }
      }
    }
  }

  // Fallback for grand total if not declared in text
  if (declaredGrandTotal === 0) {
    if (declaredTaxableValue > 0) {
      declaredGrandTotal = declaredTaxableValue + declaredCgst + declaredSgst + declaredIgst;
    } else if (lineItems.length > 0) {
      declaredTaxableValue = lineItems.reduce((acc, i) => acc + i.taxableValue, 0);
      declaredGrandTotal = lineItems.reduce((acc, i) => acc + i.totalAmount, 0);
    }
  }

  return {
    invoiceNumber,
    invoiceDate,
    supplierGstin,
    supplierName,
    recipientGstin,
    recipientName,
    placeOfSupplyState: pos,
    lineItems,
    totalTaxableValue: declaredTaxableValue,
    totalCgst: declaredCgst,
    totalSgst: declaredSgst,
    totalIgst: declaredIgst,
    grandTotal: declaredGrandTotal,
    confidenceScore: supplierGstin && declaredGrandTotal > 0 ? 0.95 : 0.6,
    rawMarkdown: text,
  };
}
