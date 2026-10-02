import { useEffect, useState } from "react";

// The imprint and privacy pages need the street address, which is kept out of
// the public app-data.json on purpose (ADR 0032). scripts/public-app-data.cjs
// writes it to public/legal.json instead, and only these two pages fetch it.
export type LegalData = {
  name: string;
  addressStreet: string;
  addressZipCode: string;
  addressCity: string;
  addressCountry: string;
  email: string;
};

const LEGAL_DATA_FIELDS: (keyof LegalData)[] = [
  "name",
  "addressStreet",
  "addressZipCode",
  "addressCity",
  "addressCountry",
  "email",
];

// Runtime data fetched over the network: anything that doesn't match the
// expected shape counts as missing rather than being rendered half-filled.
export function parseLegalData(raw: unknown): LegalData | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const record = raw as Record<string, unknown>;

  if (!LEGAL_DATA_FIELDS.every((field) => typeof record[field] === "string")) {
    return null;
  }

  return Object.fromEntries(
    LEGAL_DATA_FIELDS.map((field) => [field, record[field]]),
  ) as LegalData;
}

export async function fetchLegalData(
  fetchImpl: typeof fetch = fetch,
): Promise<LegalData | null> {
  try {
    const response = await fetchImpl("/legal.json", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    return response.ok ? parseLegalData(await response.json()) : null;
  } catch {
    return null;
  }
}

// undefined while loading, null when legal.json is missing or malformed.
export function useLegalData(): LegalData | null | undefined {
  const [legalData, setLegalData] = useState<LegalData | null | undefined>(
    undefined,
  );

  useEffect(() => {
    let isActive = true;

    void fetchLegalData().then((result) => {
      if (isActive) {
        setLegalData(result);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  return legalData;
}
