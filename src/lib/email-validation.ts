const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "throwaway.email",
  "yopmail.com",
  "10minutemail.com",
]);

export interface EmailValidationResult {
  email: string;
  isValid: boolean;
  reason?: string;
}

export function validateEmail(email: string): EmailValidationResult {
  const normalized = email.trim().toLowerCase();

  if (!normalized) {
    return { email: normalized, isValid: false, reason: "Email is empty" };
  }

  if (normalized.length > 254) {
    return { email: normalized, isValid: false, reason: "Email too long" };
  }

  if (!EMAIL_REGEX.test(normalized)) {
    return { email: normalized, isValid: false, reason: "Invalid format" };
  }

  const [, domain] = normalized.split("@");
  if (!domain || !domain.includes(".")) {
    return { email: normalized, isValid: false, reason: "Invalid domain" };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { email: normalized, isValid: false, reason: "Disposable email" };
  }

  return { email: normalized, isValid: true };
}

export function validateEmails(emails: string[]): EmailValidationResult[] {
  return emails.map(validateEmail);
}
