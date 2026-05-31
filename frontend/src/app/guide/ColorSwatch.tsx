"use client";

import { useState, useCallback } from "react";
import { varToClassBase, type ColorItem } from "./color-data";

interface ColorSwatchProps {
  item: ColorItem;
}

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

export function ColorSwatch({ item }: ColorSwatchProps) {
  const { copied, copy } = useCopy();
  const base = varToClassBase(item.varName);
  const hasBorder = item.classes.some((c) => c.suffix === "_l");

  return (
    <article className="flex min-w-[140px] max-w-[180px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* 위: 컬러로만 채움 (Aa 제거) */}
      <div
        className="min-h-[72px] flex-1"
        style={{
          backgroundColor: hasBorder ? "transparent" : `var(${item.varName})`,
          ...(hasBorder && {
            borderWidth: 4,
            borderStyle: "solid",
            borderColor: `var(${item.varName})`,
          }),
        }}
        aria-hidden
      />

      {/* 아래: 클래스 네임 두 개 + 헥스코드 (클릭 시 복사) */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 bg-gray-100 px-2 py-2">
        {item.classes.map((v) => {
          const fullClass = `${base}${v.suffix}`;
          return (
            <button
              key={v.suffix}
              type="button"
              onClick={() => copy(fullClass)}
              className="rounded bg-white px-2 py-1 text-[10px] font-mono text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              title={`클릭: .${fullClass} 복사`}
            >
              {copied === fullClass ? `${item.varName}` : `.${fullClass}`}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => copy(item.hex)}
          className="rounded bg-white px-2 py-1 text-[10px] font-mono text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
          title={`클릭: ${item.hex} 복사`}
        >
          {copied === item.hex ? `${item.varName}` : item.hex}
        </button>
      </div>
    </article>
  );
}
