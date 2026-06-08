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
  mail: "email",
  "first name": "firstName",
  firstname: "firstName",
  first_name: "firstName",
  fname: "firstName",
  "last name": "lastName",
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

function rowToContact(row: Record<string, string>): ImportedContact | null {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    const field = normalizeHeader(key);
    if (value?.trim()) normalized[field] = value.trim();
  }

  const email = normalized.email;
  if (!email) return null;

  const validation = validateEmail(email);
  const standardFields = new Set([
    "email",
    "firstName",
    "lastName",
    "company",
    "phone",
  ]);
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
    customFields:
      Object.keys(customFields).length > 0 ? customFields : undefined,
    isValid: validation.isValid,
  };
}

export function parseCSV(content: string): ImportedContact[] {
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
  });
  return result.data
    .map(rowToContact)
    .filter((c): c is ImportedContact => c !== null);
}

export function parseTXT(content: string): ImportedContact[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  return lines
    .map((line) => {
      const email = line.split(/[,;\t]/)[0]?.trim();
      if (!email) return null;
      const validation = validateEmail(email);
      return {
        email: validation.email,
        isValid: validation.isValid,
      } as ImportedContact;
    })
    .filter((c): c is ImportedContact => c !== null);
}

export function parseExcel(buffer: ArrayBuffer): ImportedContact[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);
  return rows
    .map(rowToContact)
    .filter((c): c is ImportedContact => c !== null);
}

export function parseFile(
  filename: string,
  content: string | ArrayBuffer
): ImportedContact[] {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "csv") return parseCSV(content as string);
  if (ext === "txt") return parseTXT(content as string);
  if (ext === "xlsx" || ext === "xls")
    return parseExcel(content as ArrayBuffer);
  throw new Error(`Unsupported file type: ${ext}`);
}
