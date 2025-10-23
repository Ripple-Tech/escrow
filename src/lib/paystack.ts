import "server-only";

const PAYSTACK_BASE = "https://api.paystack.co";

export async function paystack<T>(
  path: string,
  init?: RequestInit & { query?: Record<string, string | number | boolean> }
): Promise<T> {
  const params = init?.query
    ? "?" + new URLSearchParams(Object.entries(init.query).reduce((acc, [k, v]) => {
        acc[k] = String(v);
        return acc;
      }, {} as Record<string, string>)).toString()
    : "";

  const res = await fetch(`${PAYSTACK_BASE}${path}${params}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Paystack error ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json;
}

export async function listBanksNGN() {
  // https://api.paystack.co/bank?country=nigeria
  const data = await paystack<{ status: boolean; data: Array<{ name: string; code: string; id: number; slug?: string }> }>("/bank", {
    query: { country: "nigeria" },
  });
  return data.data.map(b => ({ name: b.name, code: b.code, id: String(b.id), slug: b.slug }));
}

export async function resolveAccount(bankCode: string, accountNumber: string) {
  // https://api.paystack.co/bank/resolve
  const data = await paystack<{ status: boolean; data: { account_name: string; account_number: string; bank_id?: number } }>(
    "/bank/resolve",
    {
      method: "GET",
      query: { bank_code: bankCode, account_number: accountNumber },
    }
  );
  return {
    accountName: data.data.account_name,
    accountNumber: data.data.account_number,
  };
}