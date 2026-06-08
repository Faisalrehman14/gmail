import { parseCustomFields } from "./utils";

export interface PersonalizationData {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  phone?: string | null;
  customFields?: string | null;
}

const VARIABLE_MAP: Record<string, (d: PersonalizationData) => string> = {
  "{{email}}": (d) => d.email,
  "{{first_name}}": (d) => d.firstName || "",
  "{{last_name}}": (d) => d.lastName || "",
  "{{full_name}}": (d) =>
    [d.firstName, d.lastName].filter(Boolean).join(" ") || d.email,
  "{{company}}": (d) => d.company || "",
  "{{company_name}}": (d) => d.company || "",
  "{{phone}}": (d) => d.phone || "",
};

export function personalizeContent(
  content: string,
  data: PersonalizationData
): string {
  let result = content;
  const custom = parseCustomFields(data.customFields);

  for (const [key, resolver] of Object.entries(VARIABLE_MAP)) {
    result = result.split(key).join(resolver(data));
  }

  for (const [key, value] of Object.entries(custom)) {
    result = result.split(`{{${key}}}`).join(value);
  }

  return result;
}

export const PERSONALIZATION_VARIABLES = [
  { key: "{{first_name}}", label: "First Name" },
  { key: "{{last_name}}", label: "Last Name" },
  { key: "{{full_name}}", label: "Full Name" },
  { key: "{{email}}", label: "Email" },
  { key: "{{company}}", label: "Company Name" },
  { key: "{{phone}}", label: "Phone" },
];
