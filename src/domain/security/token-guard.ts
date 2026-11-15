/**
 * GSTPIXEL Security & Token Guard
 * Protects client-side runtime from credential leaks and ensures sensitive
 * AI operations remain isolated server-side.
 */

const FORBIDDEN_STORAGE_KEYS = [
  'api_key',
  'apiKey',
  'openrouter_key',
  'llamacloud_key',
  'openai_key',
  'anthropic_key',
  'secret',
  'private_key',
];

const SECRET_PATTERNS = [
  /sk-or-v1-[a-zA-Z0-9]{32,}/g, // OpenRouter API keys
  /llx-[a-zA-Z0-9]{32,}/g,       // LlamaIndex API keys
  /AIza[0-9A-Za-z-_]{35}/g,       // Google API keys
  /ghp_[a-zA-Z0-9]{36}/g,         // GitHub PATs
  /rzp_(test|live)_[a-zA-Z0-9]{14,}/g, // Razorpay keys
  /bearer\s+[a-zA-Z0-9\-_.]{20,}/gi,   // Bearer tokens
];

/**
 * Redacts any accidental API keys or secrets from text, error messages, or logs.
 */
export function sanitizeLogOutput(input: string): string {
  if (!input) return '';
  let sanitized = input;
  for (const pattern of SECRET_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED_CREDENTIAL]');
  }
  return sanitized;
}

/**
 * Audits browser storage (localStorage & sessionStorage) and removes any
 * improperly stored API credentials. Returns list of quarantined keys if any were found.
 */
export function auditAndSanitizeBrowserStorage(): string[] {
  if (typeof window === 'undefined') return [];

  const quarantined: string[] = [];

  try {
    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && FORBIDDEN_STORAGE_KEYS.some((fk) => key.toLowerCase().includes(fk.toLowerCase()))) {
        quarantined.push(`localStorage:${key}`);
        localStorage.removeItem(key);
      }
    }

    // Check sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && FORBIDDEN_STORAGE_KEYS.some((fk) => key.toLowerCase().includes(fk.toLowerCase()))) {
        quarantined.push(`sessionStorage:${key}`);
        sessionStorage.removeItem(key);
      }
    }
  } catch {
    // Storage access may be restricted in sandboxed iframes
  }

  return quarantined;
}

/**
 * Validates that an API request payload does not exceed safe payload boundaries
 * to prevent accidental denial-of-service or credit exhaustion.
 */
export function validatePayloadSafety(payloadText: string, maxBytes = 100 * 1024): { safe: boolean; error?: string } {
  if (!payloadText) {
    return { safe: false, error: 'Empty payload provided.' };
  }

  const byteLength = new TextEncoder().encode(payloadText).length;
  if (byteLength > maxBytes) {
    return {
      safe: false,
      error: `Payload size (${Math.round(byteLength / 1024)} KB) exceeds safety threshold (${Math.round(maxBytes / 1024)} KB).`,
    };
  }

  return { safe: true };
}
