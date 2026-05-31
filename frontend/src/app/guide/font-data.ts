/**
 * color.css 폰트 스타일 기반 폰트 가이드 데이터
 * Font: Pretendard
 */

export interface FontItem {
  /** 클래스명 (예: text_2xl_bold) */
  className: string;
  /** 표시용 라벨 (예: Bold, Semibold) */
  weight: string;
  /** font-weight 숫자 */
  weightValue: number;
}

export interface FontGroup {
  /** 그룹 라벨 (예: Text 2xl) */
  label: string;
  /** 크기 설명 (예: 24px / 32px) */
  size: string;
  items: FontItem[];
}

export const fontGroups: FontGroup[] = [
  {
    label: "Text 3xl",
    size: "32px/42px",
    items: [
      { className: "text_3xl_bold", weight: "Bold", weightValue: 700 },
      { className: "text_3xl_semibold", weight: "Semibold", weightValue: 600 },
    ],
  },
  {
    label: "Text 2xl",
    size: "24px/32px",
    items: [
      { className: "text_2xl_bold", weight: "Bold", weightValue: 700 },
      { className: "text_2xl_semibold", weight: "Semibold", weightValue: 600 },
      { className: "text_2xl_medium", weight: "Medium", weightValue: 500 },
      { className: "text_2xl_regular", weight: "Regular", weightValue: 400 },
    ],
  },
  {
    label: "Text xl",
    size: "20px/32px",
    items: [
      { className: "text_xl_bold", weight: "Bold", weightValue: 700 },
      { className: "text_xl_semibold", weight: "Semibold", weightValue: 600 },
      { className: "text_xl_medium", weight: "Medium", weightValue: 500 },
      { className: "text_xl_regular", weight: "Regular", weightValue: 400 },
    ],
  },
  {
    label: "Text 2lg",
    size: "18px/24px",
    items: [
      { className: "text_2lg_bold", weight: "Bold", weightValue: 700 },
      { className: "text_2lg_semibold", weight: "Semibold", weightValue: 600 },
      { className: "text_2lg_medium", weight: "Medium", weightValue: 500 },
      { className: "text_2lg_regular", weight: "Regular", weightValue: 400 },
    ],
  },
  {
    label: "Text lg",
    size: "16px/20px",
    items: [
      { className: "text_lg_bold", weight: "Bold", weightValue: 700 },
      { className: "text_lg_semibold", weight: "Semibold", weightValue: 600 },
      { className: "text_lg_medium", weight: "Medium", weightValue: 500 },
      { className: "text_lg_regular", weight: "Regular", weightValue: 400 },
    ],
  },
  {
    label: "Text md",
    size: "14px/24px",
    items: [
      { className: "text_md_bold", weight: "Bold", weightValue: 700 },
      { className: "text_md_semibold", weight: "Semibold", weightValue: 600 },
      { className: "text_md_medium", weight: "Medium", weightValue: 500 },
      { className: "text_md_regular", weight: "Regular", weightValue: 400 },
    ],
  },
  {
    label: "Text sm",
    size: "13px/22px",
    items: [
      { className: "text_sm_semibold", weight: "Semibold", weightValue: 600 },
      { className: "text_sm_medium", weight: "Medium", weightValue: 500 },
    ],
  },
  {
    label: "Text xs",
    size: "12px/20px",
    items: [
      { className: "text_xs_semibold", weight: "Semibold", weightValue: 600 },
      { className: "text_xs_medium", weight: "Medium", weightValue: 500 },
      { className: "text_xs_regular", weight: "Regular", weightValue: 400 },
    ],
  },
];

/** 테이블용 한 행 데이터 (스타일명, 크기, weight, 클래스명) */
export interface FontRow {
  styleName: string;
  size: string;
  weight: string;
  className: string;
}

/** 폰트 가이드 테이블용 플랫 행 목록 */
export function getFontTableRows(): FontRow[] {
  return fontGroups.flatMap((group) =>
    group.items.map((item) => ({
      styleName: group.label.replace(/\s/g, "-"), // "Text 3xl" → "Text-3xl"
      size: group.size,
      weight: item.weight,
      className: item.className,
    }))
  );
}
