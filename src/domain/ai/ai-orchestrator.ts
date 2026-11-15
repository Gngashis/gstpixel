import { ExtractedGstInvoice, GstInvoiceAuditResult, AiComplianceReview, OpenRouterModelChoice, LlamaParseOptions } from './types';
import { auditExtractedGstInvoice } from './gst-verification';
import { parseGstInvoiceFromMarkdown } from './invoice-parser';
import { createOpenRouterAdvisorClient } from './openrouter-advisor-adapter';
import { createLlamaParseClient } from './llama-parse-adapter';

export interface FullInvoiceAnalysisResult {
  extracted: ExtractedGstInvoice;
  audit: GstInvoiceAuditResult;
  advisory?: AiComplianceReview;
  rawMarkdown?: string;
  jobId?: string;
}

export class GstPixelAiOrchestrator {
  private llamaClient = createLlamaParseClient();
  private openRouterClient = createOpenRouterAdvisorClient();

  /**
   * Parse an invoice document buffer using LlamaParse v2, extract fields, and audit compliance.
   */
  public async parseAndAnalyzeDocument(
    fileBuffer: Buffer,
    fileName: string,
    options?: {
      parseOptions?: LlamaParseOptions;
      generateAdvisory?: boolean;
      modelChoice?: OpenRouterModelChoice;
      maxPollRetries?: number;
      pollIntervalMs?: number;
    }
  ): Promise<FullInvoiceAnalysisResult> {
    // 1. Upload to LlamaParse v2
    const uploadRes = await this.llamaClient.uploadFile(fileBuffer, fileName, options?.parseOptions);
    const jobId = uploadRes.id;

    // 2. Poll until COMPLETED
    const maxRetries = options?.maxPollRetries ?? 15;
    const interval = options?.pollIntervalMs ?? 1500;
    let markdown = '';

    for (let i = 0; i < maxRetries; i++) {
      const statusRes = await this.llamaClient.checkJobStatus(jobId, options?.parseOptions);
      if (statusRes.status === 'COMPLETED') {
        markdown = statusRes.markdown_full || '';
        break;
      }
      if (statusRes.status === 'ERROR') {
        throw new Error(`LlamaParse job failed: ${statusRes.error_message || 'Unknown OCR error'}`);
      }
      await new Promise((r) => setTimeout(r, interval));
    }

    if (!markdown) {
      throw new Error(`LlamaParse job ${jobId} timed out before completing.`);
    }

    // 3. Extract invoice fields from OCR markdown
    const extracted = parseGstInvoiceFromMarkdown(markdown);

    // 4. Run statutory and mathematical audit
    return this.analyzeInvoice(extracted, {
      generateAdvisory: options?.generateAdvisory,
      modelChoice: options?.modelChoice,
      jobId,
      rawMarkdown: markdown,
    });
  }

  /**
   * Complete end-to-end statutory audit of an extracted invoice.
   */
  public async analyzeInvoice(
    invoice: ExtractedGstInvoice,
    options?: {
      generateAdvisory?: boolean;
      modelChoice?: OpenRouterModelChoice;
      jobId?: string;
      rawMarkdown?: string;
    }
  ): Promise<FullInvoiceAnalysisResult> {
    const audit = auditExtractedGstInvoice(invoice);

    let advisory: AiComplianceReview | undefined;
    if (options?.generateAdvisory) {
      const prompt = `Review this parsed Indian GST invoice:
Supplier GSTIN: ${invoice.supplierGstin || 'None'}
Recipient GSTIN: ${invoice.recipientGstin || 'B2C / Unregistered'}
Declared Taxable: ₹${invoice.totalTaxableValue.toFixed(2)}
Declared Tax Heads: CGST=₹${invoice.totalCgst.toFixed(2)}, SGST=₹${invoice.totalSgst.toFixed(2)}, IGST=₹${invoice.totalIgst.toFixed(2)}
Declared Grand Total: ₹${invoice.grandTotal.toFixed(2)}
Statutory Audit Result: ${audit.isValid ? 'VALID' : 'INVALID'}
Audit Issues Detected: ${audit.issues.map((i) => `[${i.severity.toUpperCase()}] ${i.message}`).join('; ') || 'None'}
Line Items: ${invoice.lineItems.map((li) => `${li.description} (HSN: ${li.hsnOrSac || 'N/A'}, Taxable: ₹${li.taxableValue}, Rate: ${li.gstRate}%)`).join(', ') || 'No line items'}`;

      try {
        advisory = await this.openRouterClient.generateGstAdvisory(prompt, options.modelChoice);
      } catch {
        advisory = {
          summary: 'Statutory mathematical audit completed. Network advisory deferred.',
          statutoryRisks: audit.issues.filter((i) => i.severity === 'error').map((i) => i.message),
          suggestedActions: [
            'Verify invoice totals against original purchase vouchers.',
            'Confirm validity of supplier GSTIN on official GST Portal before claiming Input Tax Credit (ITC).',
          ],
          modelUsed: 'local-audit-engine',
          latencyMs: 0,
        };
      }
    }

    return {
      extracted: invoice,
      audit,
      advisory,
      rawMarkdown: options?.rawMarkdown || invoice.rawMarkdown,
      jobId: options?.jobId,
    };
  }
}
