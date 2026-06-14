// 과목 구분 (전공 / 교양 / 자유)
export const CATEGORIES = [
  { id: "major", label: "전공" },
  { id: "liberal", label: "교양" },
  { id: "free", label: "자유" },
];

// id → 한글 라벨
export function categoryLabel(id) {
  const found = CATEGORIES.find((c) => c.id === id);
  return found ? found.label : "전공";
}

// 알 수 없는 값은 전공으로 취급 (계산/표시 기본값)
export function normalizeCategory(id) {
  return id === "liberal" || id === "free" ? id : "major";
}
