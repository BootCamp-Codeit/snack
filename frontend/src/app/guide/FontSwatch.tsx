"use client";

import { useState, useCallback } from "react";
import type { FontItem } from "./font-data";

interface FontSwatchProps {
  item: FontItem;
}

const SAMPLE_TEXT = "가나다라마바사 ABC 012";

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, []);
  return { copied, copy };
}

export function FontSwatch({ item }: FontSwatchProps) {
  const { copied, copy } = useCopy();

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* 위: 폰트 미리보기 */}
      <div className="min-h-[64px] px-4 py-3 black_black_400_t">
        <span className={item.className}>{SAMPLE_TEXT}</span>
      </div>
      {/* 아래: 클래스명 (클릭 시 복사) */}
      <button
        type="button"
        onClick={() => copy(item.className)}
        className="flex items-center justify-center gap-1.5 bg-gray-100 px-3 py-2 text-left text-[10px] font-mono text-gray-600 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
        title={`클릭: .${item.className} 복사`}
      >
        {copied ? (
          <span className="text-green-600 font-medium">복사됨!</span>
        ) : (
          <>
            <span>.{item.className}</span>
            <span className="text-gray-400">·</span>
            <span>{item.weight}</span>
          </>
        )}
      </button>
    </article>
  );
}
