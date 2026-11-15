/**
 * GSTPIXEL AI Services Domain Types
 * Unified interface for multi-provider AI integrations:
 * - LlamaCloud (LlamaParse for invoice/tax document OCR)
 * - OpenRouter (Multi-model reasoning for GST compliance and filing review)
 * - Deepgram Nova-2 (Voice-to-tax transcription for regional speech queries)
 * - Exa (Neural semantic search for GST circulars, notifications, and AAR rulings)
 */

export type DocumentType = 'tax_invoice' | 'bill_of_supply' | 'gst_notice' | 'bank_statement' | 'registration_cert';

export interface LlamaParseOptions {
  apiKey?: string;
  tier?: 'free' | 'premium';
  language?: string;
  invalidateCache?: boolean;
}

export interface ParsedInvoiceLineItem {
  description: string;
  hsnOrSac?: string;
  quantity?: number;
  unitPrice?: number;
  taxableValue: number;
  gstRate: number; // e.g. 5, 12, 18, 28
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  totalAmount: number;
}

export interface ExtractedGstInvoice {
  invoiceNumber?: string;
  invoiceDate?: string;
  supplierGstin?: string;
  supplierName?: string;
  recipientGstin?: string;
  recipientName?: string;
  placeOfSupplyState?: string;
  lineItems: ParsedInvoiceLineItem[];
  totalTaxableValue: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  grandTotal: number;
  confidenceScore: number;
  rawMarkdown?: string;
}

export interface GstValidationIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  field?: string;
}

export interface GstInvoiceAuditResult {
  isValid: boolean;
  issues: GstValidationIssue[];
  computedTotals: {
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
    grandTotal: number;
  };
  reconciliationDelta: number;
}

export interface OpenRouterModelChoice {
  modelId: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiComplianceReview {
  summary: string;
  statutoryRisks: string[];
  suggestedActions: string[];
  modelUsed: string;
  latencyMs: number;
}

export interface VoiceTranscriptionResult {
  transcript: string;
  confidence: number;
  wordsCount: number;
  durationSeconds: number;
}

export interface LegalSearchResultItem {
  title: string;
  url: string;
  snippet: string;
  score: number;
  publishedDate?: string;
}
