import { StoredInvoiceRecord, InvoiceFilter } from './types';

const STORAGE_KEY_INVOICES = 'gstpixel_saas_invoices_v1';

const INITIAL_SEEDED_INVOICES: StoredInvoiceRecord[] = [
  {
    id: 'inv_rec_001',
    userId: 'usr_comm_01',
    invoiceNumber: 'INV-2026-081',
    invoiceDate: '15-11-2026',
    supplierGstin: '27AAPFU0939F1ZV',
    supplierName: 'Apex Cloud Infotech Ltd',
    recipientGstin: '27AAPFU0939F1ZV',
    recipientName: 'Jaigaon Hardware Store',
    placeOfSupplyState: '27 (Maharashtra)',
    taxableAmount: 10000.0,
    taxAmount: 1800.0,
    grandTotal: 11800.0,
    auditStatus: 'COMPLIANT',
    issuesCount: 0,
    issues: [],
    rawTextSnippet: 'TAX INVOICE INV-2026-081 | Web Platform Development | Taxable: 10000 | CGST: 900, SGST: 900',
    auditedAt: '2026-11-15T18:00:00Z',
  },
  {
    id: 'inv_rec_002',
    userId: 'usr_comm_01',
    invoiceNumber: 'INV-2026-092',
    invoiceDate: '15-11-2026',
    supplierGstin: '27AAPFU0939F1ZV',
    supplierName: 'Metropolitan Logistics',
    recipientGstin: '27AAPFU0939F1ZV',
    recipientName: 'Jaigaon Hardware Store',
    placeOfSupplyState: '27 (Intra-state)',
    taxableAmount: 5000.0,
    taxAmount: 900.0,
    grandTotal: 5900.0,
    auditStatus: 'FLAGGED',
    issuesCount: 1,
    issues: ['Intra-state supply with place of supply 27 erroneously charged IGST instead of CGST + SGST.'],
    rawTextSnippet: 'TAX INVOICE INV-2026-092 | Freight | Taxable: 5000 | IGST: 900',
    auditedAt: '2026-11-15T18:20:00Z',
  },
];

type StorageListener = () => void;

class InvoiceStorageRepository {
  private invoices: StoredInvoiceRecord[] = [];
  private listeners: Set<StorageListener> = new Set();

  constructor() {
    this.invoices = [...INITIAL_SEEDED_INVOICES];
    if (typeof window !== 'undefined') {
      this.restore();
    }
  }

  private restore() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INVOICES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.invoices = parsed;
        }
      }
    } catch {
      // Use in-memory fallback
    }
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(this.invoices));
      } catch {}
    }
    this.notify();
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public subscribe(listener: StorageListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getAllInvoices(): StoredInvoiceRecord[] {
    return [...this.invoices];
  }

  public getFilteredInvoices(filter?: InvoiceFilter): StoredInvoiceRecord[] {
    let result = [...this.invoices];

    if (filter?.status && filter.status !== 'ALL') {
      result = result.filter((inv) => inv.auditStatus === filter.status);
    }

    if (filter?.searchQuery && filter.searchQuery.trim()) {
      const query = filter.searchQuery.trim().toLowerCase();
      result = result.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(query) ||
          inv.supplierGstin.toLowerCase().includes(query) ||
          (inv.supplierName && inv.supplierName.toLowerCase().includes(query))
      );
    }

    return result.sort((a, b) => new Date(b.auditedAt).getTime() - new Date(a.auditedAt).getTime());
  }

  public async syncWithServer(userId?: string): Promise<StoredInvoiceRecord[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/invoices', {
          headers: userId ? { Authorization: `Bearer ${userId}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.invoices) && data.invoices.length > 0) {
            this.invoices = data.invoices;
            this.persist();
          }
        }
      } catch {
        // Fallback to local storage
      }
    }
    return [...this.invoices];
  }

  public addInvoice(record: Omit<StoredInvoiceRecord, 'id' | 'auditedAt'>): StoredInvoiceRecord {
    const newRecord: StoredInvoiceRecord = {
      ...record,
      id: `inv_rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      auditedAt: new Date().toISOString(),
    };

    // Deduplicate if invoiceNumber and supplierGstin already exist
    const existingIndex = this.invoices.findIndex(
      (inv) => inv.invoiceNumber === newRecord.invoiceNumber && inv.supplierGstin === newRecord.supplierGstin
    );

    if (existingIndex >= 0) {
      this.invoices[existingIndex] = newRecord;
    } else {
      this.invoices.unshift(newRecord);
    }

    this.persist();

    // Asynchronously synchronize with server database
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecord),
        }).catch(() => {});
      } catch {}
    }

    return newRecord;
  }

  public deleteInvoice(id: string): boolean {
    const initialLength = this.invoices.length;
    this.invoices = this.invoices.filter((inv) => inv.id !== id);
    if (this.invoices.length !== initialLength) {
      this.persist();

      // Asynchronously delete from server database
      if (typeof window !== 'undefined') {
        try {
          fetch(`/api/invoices?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
          }).catch(() => {});
        } catch {}
      }

      return true;
    }
    return false;
  }

  public clearAll() {
    this.invoices = [];
    this.persist();
  }

  public resetToSample() {
    this.invoices = [...INITIAL_SEEDED_INVOICES];
    this.persist();
  }
}

export const invoiceStorageRepository = new InvoiceStorageRepository();
