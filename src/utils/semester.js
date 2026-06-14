// 학기(언제 들었는지) 관련 helper
// 학기는 "2024-1" 형태 문자열로 저장 (연도-학기코드). 코드: 1=1학기, 2=2학기, S=계절

export const TERMS = [
  { code: "1", label: "1학기" },
  { code: "2", label: "2학기" },
  { code: "S", label: "계절학기" },
];

// 학기코드 → 한글 라벨
export function termLabel(code) {
  const found = TERMS.find((t) => t.code === code);
  return found ? found.label : code;
}

// "2024-1" → "2024 1학기"
export function formatSemester(semester) {
  if (!semester) return "";
  const [year, code] = semester.split("-");
  return code ? `${year} ${termLabel(code)}` : year;
}

// 정렬용 키 (빈 값/미상은 가장 뒤로 보냄)
export function semesterSortKey(semester) {
  return semester && semester.trim() ? semester : "9999-9";
}

// 학년도 선택지 (올해부터 최근 8년)
export function recentYears() {
  const cur = new Date().getFullYear();
  const years = [];
  for (let y = cur; y >= cur - 7; y--) years.push(y);
  return years;
}
