export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => JSON.stringify(row[h] ?? "")).join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function tsToDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString();
}

export function tsToTime(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleTimeString();
}

export function dateToTs(date: Date): bigint {
  return BigInt(date.getTime()) * 1_000_000n;
}

export function todayTs(): bigint {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return dateToTs(d);
}

export function nowTs(): bigint {
  return BigInt(Date.now()) * 1_000_000n;
}

export function generateId(): string {
  return crypto.randomUUID();
}
