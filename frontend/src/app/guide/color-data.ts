/**
 * color.css 기반 컬러 가이드 데이터
 * _b: background-color / _t: color / _l: border-color
 */
export type ColorVariant = { suffix: "_b" | "_t" | "_l"; label: string };

export interface ColorItem {
  /** CSS 변수명 (--black-black-100) */
  varName: string;
  /** 헥스 값 */
  hex: string;
  /** 사용 가능한 유틸리티 클래스들 */
  classes: ColorVariant[];
}

export interface ColorGroup {
  label: string;
  items: ColorItem[];
}

function item(
  varName: string,
  hex: string,
  classes: ColorVariant[] = [
    { suffix: "_b", label: "배경" },
    { suffix: "_t", label: "글자" },
  ]
): ColorItem {
  return { varName, hex, classes };
}

/** CSS 변수명을 클래스 베이스로 변환 (--primary-orange-400 → primary_orange_400) */
export function varToClassBase(varName: string): string {
  return varName.replace(/^--/, "").replace(/-/g, "_");
}

/** 전체 컬러 그룹 데이터 */
export const colorGroups: ColorGroup[] = [
  {
    label: "Black",
    items: [
      item("--black-black-100", "#6B6B6B"),
      item("--black-black-200", "#525252"),
      item("--black-black-300", "#373737"),
      item("--black-black-400", "#1F1F1F"),
      item("--black-black-500", "#040404"),
    ],
  },
  {
    label: "Gray",
    items: [
      item("--gray-gray-50", "#FFFFFF"),
      item("--gray-gray-100", "#E9E9E9"),
      item("--gray-gray-200", "#E0E0E0"),
      item("--gray-gray-300", "#C4C4C4"),
      item("--gray-gray-400", "#ABABAB"),
      item("--gray-gray-500", "#999999"),
    ],
  },
  {
    label: "Primary - Orange",
    items: [
      item("--primary-orange-100", "#FEF3EB"),
      item("--primary-orange-200", "#FDE1CD"),
      item("--primary-orange-300", "#FCC49C"),
      item("--primary-orange-400", "#F97B22"),
    ],
  },
  {
    label: "Secondary - Illustration",
    items: [
      item("--secondary-illustration-01", "#FFBDE8"),
      item("--secondary-illustration-02", "#FEE8B0"),
      item("--secondary-illustration-03", "#9CA777"),
      item("--secondary-illustration-05", "#5CB783"),
      item("--secondary-illustration-06", "#64D396"),
    ],
  },
  {
    label: "Background",
    items: [
      item("--background-background-100", "#FAFAFA"),
      item("--background-background-200", "#F7F7F7"),
      item("--background-background-300", "#EFEFEF"),
      item("--background-background-400", "#FBF8F4"),
      item("--background-background-500", "#FDF0DF"),
    ],
  },
  {
    label: "Line",
    items: [
      item("--line-line-100", "#F2F2F2", [{ suffix: "_l", label: "테두리" }]),
      item("--line-line-200", "#E6E6E6", [{ suffix: "_l", label: "테두리" }]),
    ],
  },
  {
    label: "State",
    items: [item("--state-state-01", "#F63B20")],
  },
];
