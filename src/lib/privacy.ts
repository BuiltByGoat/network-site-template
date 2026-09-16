export type PrivacyFinding = {
  rule: string;
  match: string;
  file: string;
};

export const PRIVACY_RULES: {
  name: string;
  regex: RegExp;
}[] = [
  {
    name: "wallet-like-hex",
    regex: /\b0x[a-fA-F0-9]{40}\b/g,
  },
  {
    name: "invite-path",
    regex: /\/invite(?:\/|[?#]|"|'|$)/gi,
  },
  {
    name: "elotto",
    regex: /\belotto\b/gi,
  },
  {
    name: "referral-query",
    regex: /[?&](?:ref|referral|referrer|invite)=/gi,
  },
  {
    name: "assigned-api-key",
    regex: /MEGAPOT_API_KEY\s*[:=]\s*["'][^"']+["']/g,
  },
  {
    name: "private-key-block",
    regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  },
];

const TEXT_EXTENSIONS = new Set([
  ".css",
  ".htm",
  ".html",
  ".js",
  ".json",
  ".map",
  ".svg",
  ".txt",
  ".xml",
]);

export function isScannableFile(fileName: string): boolean {
  const dot = fileName.lastIndexOf(".");
  if (dot === -1) {
    return false;
  }
  return TEXT_EXTENSIONS.has(fileName.slice(dot).toLowerCase());
}

export function scanText(file: string, source: string): PrivacyFinding[] {
  const findings: PrivacyFinding[] = [];

  for (const rule of PRIVACY_RULES) {
    const matches = source.matchAll(
      new RegExp(rule.regex.source, rule.regex.flags),
    );
    for (const match of matches) {
      findings.push({
        rule: rule.name,
        match: match[0],
        file,
      });
    }
  }

  return findings;
}
