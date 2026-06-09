import { parseCustomFields } from "./utils";

export interface PersonalizationData {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  phone?: string | null;
  customFields?: string | null;
}

function globalVars(trackingId?: string, appUrl?: string): Record<string, string> {
  const vars: Record<string, string> = {
    "{{facebook_link}}":
      process.env.NEXT_PUBLIC_FACEBOOK_URL ||
      "https://www.facebook.com/casinoroyalusa12",
    "{{website_link}}":
      process.env.NEXT_PUBLIC_WEBSITE_URL || "https://casinoroyalusa.com",
    "{{contact_phone}}":
      process.env.NEXT_PUBLIC_CONTACT_PHONE || "+917080849048",
  };
  if (trackingId && appUrl) {
    vars["{{unsubscribe_link}}"] = `${appUrl}/api/track/unsubscribe/${trackingId}`;
  }
  return vars;
}

const VARIABLE_MAP: Record<string, (d: PersonalizationData) => string> = {
  "{{email}}": (d) => d.email,
  "{{first_name}}": (d) => d.firstName || "there",
  "{{last_name}}": (d) => d.lastName || "",
  "{{full_name}}": (d) =>
    [d.firstName, d.lastName].filter(Boolean).join(" ") || d.email,
  "{{company}}": (d) => d.company || "",
  "{{company_name}}": (d) => d.company || "",
  "{{phone}}": (d) => d.phone || "",
};

export function personalizeContent(
  content: string,
  data: PersonalizationData,
  extras?: { trackingId?: string; appUrl?: string }
): string {
  let result = content;
  const custom = parseCustomFields(data.customFields);

  for (const [key, resolver] of Object.entries(VARIABLE_MAP)) {
    result = result.split(key).join(resolver(data));
  }

  for (const [key, value] of Object.entries(
    globalVars(extras?.trackingId, extras?.appUrl)
  )) {
    result = result.split(key).join(value);
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
  { key: "{{facebook_link}}", label: "Facebook Messenger" },
  { key: "{{website_link}}", label: "Website URL" },
  { key: "{{contact_phone}}", label: "Contact Phone" },
  { key: "{{unsubscribe_link}}", label: "Unsubscribe Link" },
];
