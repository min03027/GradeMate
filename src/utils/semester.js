// 학기(언제 들었는지) 관련 helper
// 학기는 "1-1" 형태 문자열로 저장 (학년-학기코드). 코드: 1=1학기, 2=2학기, S=계절

// 코드는 학년 내 시간순으로 정렬되도록 둠 (1 < 1S < 2 < 2S)
export const TERMS = [
  { code: "1", label: "1학기" },
  { code: "1S", label: "여름 계절학기" },
  { code: "2", label: "2학기" },
  { code: "2S", label: "겨울 계절학기" },
];

// 학기코드 → 한글 라벨
export function termLabel(code) {
  const found = TERMS.find((t) => t.code === code);
  if (found) return found.label;
  if (code === "S") return "계절학기"; // 옛 데이터 호환
  return code;
}

// "2-1" → "2학년 1학기"
export function formatSemester(semester) {
  if (!semester) return "";
  const [grade, code] = semester.split("-");
  return code ? `${grade}학년 ${termLabel(code)}` : `${grade}학년`;
}

// 정렬용 키 (빈 값/미상은 가장 뒤로 보냄)
export function semesterSortKey(semester) {
  return semester && semester.trim() ? semester : "9-9";
}

// 학년 선택지 (1 ~ maxGrade). 학과에 따라 4/5/6학년까지
export function gradeOptions(maxGrade = 4) {
  const list = [];
  for (let g = 1; g <= maxGrade; g++) list.push(g);
  return list;
}

// 이수한 "정규학기" 수 (계절학기 제외, 서로 다른 학년-학기만 카운트)
export function countRegularSemesters(subjects) {
  const set = new Set();
  subjects.forEach((s) => {
    if (!s.semester) return;
    const code = s.semester.split("-")[1]; // 학기 코드
    if (code === "1" || code === "2") set.add(s.semester);
  });
  return set.size;
}
