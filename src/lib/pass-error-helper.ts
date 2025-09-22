// /lib/pass-error-helper.ts

export async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function extractCodeFromMessage(msg?: string): string | undefined {
  if (!msg) return undefined;
  const m = msg.match(/^\s*\[([A-Z0-9_:-]+)\]\s*/);
  return m?.[1];
}

export function extractErrorMessage(res: Response, body: any) {
  if (body && typeof body === "object") {
    if (typeof body.message === "string" && body.message.trim()) {
      return body.message.replace(/^\s*\[[^\]]+\]\s*/, "").trim();
    }
    if (typeof body.error === "string" && body.error.trim()) {
      return body.error.trim();
    }
  }
  switch (res.status) {
    case 400:
      return "Request could not be processed. Please check your input and try again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested escrow could not be found.";
    case 409:
      return "This escrow has already been accepted by another user.";
    case 500:
      return "An unexpected error occurred. Please try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/**
 * Throws a normalized Error if res is not ok.
 * If the server's message starts with [CODE], we set err.code to that value.
 */
export async function throwIfNotOk(res: Response) {
  if (res.ok) return;

  const body = await parseJsonSafe(res);
  const rawMessage = body?.message || 'An unknown error occurred.';

  const code = extractCodeFromMessage(rawMessage);
  const message = extractErrorMessage(res, body);

  const err = new Error(message) as Error & { code?: string; status?: number; raw?: any };
  err.status = res.status;
  err.code = code ?? undefined; // ✅ always attach code
  err.raw = body ?? null;

  throw err;
}
