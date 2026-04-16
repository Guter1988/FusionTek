
/**
 * Simple AI security utility to detect suspicious patterns and sanitize output.
 */

const SUSPICIOUS_PATTERNS = [
  /ignore previous instructions/i,
  /system prompt/i,
  /reveal your instructions/i,
  /reveal the system prompt/i,
  /do not return json/i,
  /output plain text/i,
  /classify this as positive/i,
  /forget everything/i,
  /you are now/i,
  /markdown code fence/i,
  /<<<|>>>|\[\[\[|\]\]\]/ // Common custom delimiters
];

export function isSuspiciousInput(input: string): boolean {
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Basic cleanup for LLM output to prevent prompt leakage or malformed text
 * from affecting the application logic more than necessary.
 */
export function sanitizeLlmOutput(output: string): string {
  // Remove potential instruction-like text that might have leaked into output
  let cleaned = output.replace(/SYSTEM PROMPT:|INSTRUCTIONS:|USER FEEDBACK:/gi, '');
  
  // Basic XSS cleanup just in case fields are rendered unsafely
  // Note: App-layer validation and front-end rendering should be the primary defense
  cleaned = cleaned.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '[REMOVED SCRIPT]');
  
  return cleaned.trim();
}
