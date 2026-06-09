import { validateEmail } from "../email-validation";

export interface VerifiedContact {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  isValid: boolean;
  reason?: string;
}

export function verifyContactList(
  contacts: VerifiedContact[]
): { valid: VerifiedContact[]; invalid: VerifiedContact[] } {
  const seen = new Set<string>();
  const valid: VerifiedContact[] = [];
  const invalid: VerifiedContact[] = [];

  for (const contact of contacts) {
    const result = validateEmail(contact.email);

    if (!result.isValid) {
      invalid.push({ ...contact, email: result.email, isValid: false, reason: result.reason });
      continue;
    }

    if (seen.has(result.email)) {
      invalid.push({ ...contact, email: result.email, isValid: false, reason: "Duplicate" });
      continue;
    }

    seen.add(result.email);
    valid.push({ ...contact, email: result.email, isValid: true });
  }

  return { valid, invalid };
}
