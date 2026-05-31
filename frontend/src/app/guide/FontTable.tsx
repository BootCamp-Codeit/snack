"use client";

import { useState, useCallback } from "react";
import type { FontRow } from "./font-data";

const PREVIEW_TEXT = "Pretendard";

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    }
  }, []);
  return { copied, copy };
}

export function FontTable({ rows }: { rows: FontRow[] }) {
  const { copied, copy } = useCopy();

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              Style Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              Font Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              Size / Line height
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              Weight
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              Preview
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              Class (click to copy)
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.className}
              className="border-b border-gray-100 last:border-b-0"
            >
              <td className="px-4 py-3 text-sm text-gray-800">{row.styleName}</td>
              <td className="px-4 py-3 text-sm text-gray-600">Pretendard</td>
              <td className="px-4 py-3 text-sm text-gray-600">{row.size}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{row.weight}</td>
              <td className="px-4 py-3">
                <span className={`black_black_400_t ${row.className}`}>
                  {PREVIEW_TEXT}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => copy(row.className)}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-mono text-gray-700 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  title={`클릭: ${row.className} 복사`}
                >
                  {copied === row.className ? `${row.className}` : row.className}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
