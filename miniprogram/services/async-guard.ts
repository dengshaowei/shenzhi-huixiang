export function userSafeError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === "object" && error !== null && "errMsg" in error) {
    const errMsg = (error as { readonly errMsg?: unknown }).errMsg;
    if (typeof errMsg === "string" && errMsg.trim()) {
      return errMsg.replace(/^[^:]+:\s*/, "").trim() || fallback;
    }
  }
  return fallback;
}

export function withTimeout<T>(operation: PromiseLike<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    Promise.resolve(operation).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
