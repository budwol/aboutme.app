import { afterEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import {
  fetchLegalData,
  LegalData,
  parseLegalData,
  useLegalData,
} from "@utils/legalData";

const validLegalData: LegalData = {
  name: "Jane Example",
  addressStreet: "Straße 1",
  addressZipCode: "01234",
  addressCity: "Berlin",
  addressCountry: "Deutschland",
  email: "jane@example.com",
};

function jsonResponse(body: unknown, ok = true) {
  return { ok, json: async () => body } as Response;
}

function LegalDataProbe({
  onValue,
}: {
  onValue: (value: ReturnType<typeof useLegalData>) => void;
}) {
  onValue(useLegalData());
  return React.createElement("LegalDataProbe");
}

describe("parseLegalData", () => {
  it("keeps exactly the expected fields of a well-formed object", () => {
    expect(parseLegalData({ ...validLegalData, phone: "+49 123" })).toEqual(
      validLegalData,
    );
  });

  it("returns null for anything that isn't a complete object", () => {
    expect(parseLegalData(null)).toBeNull();
    expect(parseLegalData("legal")).toBeNull();
    expect(parseLegalData({ ...validLegalData, addressStreet: 1 })).toBeNull();
  });
});

describe("fetchLegalData", () => {
  it("fetches legal.json without caching and parses it", async () => {
    const fetchImpl = jest.fn(async () => jsonResponse(validLegalData));

    await expect(fetchLegalData(fetchImpl as never)).resolves.toEqual(
      validLegalData,
    );
    expect(fetchImpl).toHaveBeenCalledWith("/legal.json", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  });

  it("returns null for a failed response", async () => {
    const fetchImpl = jest.fn(async () => jsonResponse(validLegalData, false));

    await expect(fetchLegalData(fetchImpl as never)).resolves.toBeNull();
  });

  it("returns null when the request throws", async () => {
    const fetchImpl = jest.fn(async () => {
      throw new Error("offline");
    });

    await expect(fetchLegalData(fetchImpl as never)).resolves.toBeNull();
  });
});

describe("useLegalData", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("is undefined while loading and the parsed data afterwards", async () => {
    globalThis.fetch = jest.fn(async () =>
      jsonResponse(validLegalData),
    ) as never;
    const values: ReturnType<typeof useLegalData>[] = [];

    await act(async () => {
      TestRenderer.create(
        <LegalDataProbe onValue={(value) => values.push(value)} />,
      );
    });

    expect(values[0]).toBeUndefined();
    expect(values.at(-1)).toEqual(validLegalData);
  });

  it("ignores a response that arrives after unmounting", async () => {
    let resolveFetch: (response: Response) => void = () => undefined;
    globalThis.fetch = jest.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    ) as never;
    const values: ReturnType<typeof useLegalData>[] = [];
    let renderer: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      renderer = TestRenderer.create(
        <LegalDataProbe onValue={(value) => values.push(value)} />,
      );
    });
    act(() => {
      renderer!.unmount();
    });
    await act(async () => {
      resolveFetch(jsonResponse(validLegalData));
    });

    expect(values).toEqual([undefined]);
  });
});
