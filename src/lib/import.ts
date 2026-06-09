import Papa from "papaparse";
import * as XLSX from "xlsx";
import { validateEmail } from "./email-validation";

export interface ImportedContact {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  customFields?: Record<string, string>;
  isValid: boolean;
}

const FIELD_ALIASES: Record<string, string> = {
  email: "email",
  "e-mail": "email",
  "e-mail 1 - value": "email",
  "e-mail 2 - value": "email",
  "email address": "email",
  "email 1 - value": "email",
  mail: "email",
  "first name": "firstName",
  "given name": "firstName",
  firstname: "firstName",
  first_name: "firstName",
  fname: "firstName",
  name: "firstName",
  "last name": "lastName",
  "family name": "lastName",
  lastname: "lastName",
  last_name: "lastName",
  lname: "lastName",
  company: "company",
  "company name": "company",
  company_name: "company",
  organization: "company",
  phone: "phone",
  telephone: "phone",
  mobile: "phone",
};

function normalizeHeader(header: string): string {
  const key = header.trim().toLowerCase();
  return FIELD_ALIASES[key] || key;
}

function isValidEmailString(value: string): boolean {
  return validateEmail(value.trim()).isValid;
}

/** Find email anywhere in a row (handles missing headers & single-column sheets) */
function findEmailInRow(row: Record<string, string>): string | null {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    const field = normalizeHeader(key);
    if (value?.trim()) normalized[field] = value.trim();
    // Column header itself might be an email (headerless export treated as header)
    if (isValidEmailString(key)) return validateEmail(key.trim()).email;
  }

  if (normalized.email && isValidEmailString(normalized.email)) {
    return validateEmail(normalized.email).email;
  }

  // Scan all cell values for a valid email
  for (const value of Object.values(row)) {
    if (value?.trim() && isValidEmailString(value)) {
      return validateEmail(value.trim()).email;
    }
  }

  return null;
}

function rowToContact(row: Record<string, string>): ImportedContact | null {
  const email = findEmailInRow(row);
  if (!email) return null;

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    const field = normalizeHeader(key);
    if (value?.trim()) normalized[field] = value.trim();
  }

  const validation = validateEmail(email);
  const standardFields = new Set(["email", "firstName", "lastName", "company", "phone"]);
  const customFields: Record<string, string> = {};
  for (const [key, value] of Object.entries(normalized)) {
    if (!standardFields.has(key)) customFields[key] = value;
  }

  return {
    email: validation.email,
    firstName: normalized.firstName,
    lastName: normalized.lastName,
    company: normalized.company,
    phone: normalized.phone,
    customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
    isValid: validation.isValid,
  };
}

/** Keep first occurrence of each email (case-insensitive) */
export function dedupeContacts(contacts: ImportedContact[]): {
  contacts: ImportedContact[];
  duplicatesRemoved: number;
} {
  const seen = new Set<string>();
  const unique: ImportedContact[] = [];

  for (const contact of contacts) {
    const validation = validateEmail(contact.email);
    const email = validation.email;
    if (seen.has(email)) continue;
    seen.add(email);
    unique.push({ ...contact, email, isValid: contact.isValid && validation.isValid });
  }

  return {
    contacts: unique,
    duplicatesRemoved: contacts.length - unique.length,
  };
}

function parsePlainEmailList(cells: string[]): ImportedContact[] {
  const results: ImportedContact[] = [];
  const seen = new Set<string>();

  for (const cell of cells) {
    const trimmed = cell?.toString().trim();
    if (!trimmed) continue;

    // Handle comma/semicolon separated in one cell
    const parts = trimmed.split(/[,;\s]+/).filter(Boolean);
    for (const part of parts) {
      const validation = validateEmail(part);
      if (validation.isValid && !seen.has(validation.email)) {
        seen.add(validation.email);
        results.push({ email: validation.email, isValid: true });
      }
    }
  }

  return results;
}

export function parseCSV(content: string): ImportedContact[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  const firstLine = lines[0]?.trim() || "";

  // No header row — first line is already an email
  if (isValidEmailString(firstLine.split(/[,;\t]/)[0] || "")) {
    return parsePlainEmailList(lines);
  }

  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
  });

  const contacts = result.data
    .map(rowToContact)
    .filter((c): c is ImportedContact => c !== null);

  if (contacts.length === 0) {
    return parsePlainEmailList(lines);
  }

  return contacts;
}

export function parseTXT(content: string): ImportedContact[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  return parsePlainEmailList(lines.map((l) => l.split(/[,;\t]/)[0] || ""));
}

export function parseExcel(buffer: ArrayBuffer): ImportedContact[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // Try with headers first
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);
  const withHeaders = rows
    .map(rowToContact)
    .filter((c): c is ImportedContact => c !== null);

  if (withHeaders.length > 0) return withHeaders;

  // No headers — plain list (Google Sheets export with just emails in column A)
  const rawRows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" });
  const allCells: string[] = [];

  for (const row of rawRows) {
    if (!Array.isArray(row)) continue;
    for (const cell of row) {
      if (cell?.toString().trim()) allCells.push(cell.toString().trim());
    }
  }

  return parsePlainEmailList(allCells);
}

function parseFileRaw(
  filename: string,
  content: string | ArrayBuffer
): ImportedContact[] {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "csv") return parseCSV(content as string);
  if (ext === "txt") return parseTXT(content as string);
  if (ext === "xlsx" || ext === "xls") return parseExcel(content as ArrayBuffer);
  throw new Error(`Unsupported file type: ${ext}`);
}

export function parseFile(
  filename: string,
  content: string | ArrayBuffer
): ImportedContact[] {
  return dedupeContacts(parseFileRaw(filename, content)).contacts;
}

export function parseFileWithStats(
  filename: string,
  content: string | ArrayBuffer
): { contacts: ImportedContact[]; duplicatesRemoved: number; rawCount: number } {
  const raw = parseFileRaw(filename, content);
  const { contacts, duplicatesRemoved } = dedupeContacts(raw);
  return { contacts, duplicatesRemoved, rawCount: raw.length };
}
