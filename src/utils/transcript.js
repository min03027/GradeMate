// 성적표 텍스트를 분석해서 과목 목록으로 바꿔주는 파서
// 삼육대 성적표는 좌/우 2단 레이아웃이라, PDF/이미지에서 추출하면
// 한 줄에 좌·우 과목이 같이 섞여 들어올 수 있음 → 한 줄에서 과목 여러 개를 뽑음.
// (완벽하진 않으니 화면에서 미리보기 표로 보여주고 사용자가 고칠 수 있게 함)

// 인식 가능한 성적 토큰 (A0=A 표기, FA/NP/W 특수표기 포함)
// 순서 중요: A+ 를 A 보다 먼저. OCR이 "A+"를 "A +"로 읽는 경우 대비해 \s* 허용
const GRADE_PATTERN =
  "(A\\s*\\+|A0|A|B\\s*\\+|B0|B|C\\s*\\+|C0|C|D\\s*\\+|D0|D|FA|F|NP|P|W)";

// "학점(숫자) 성적" 패턴 (구분자는 공백/탭/콤마). 전역 검색으로 한 줄에서 여러 개 찾음
// 끝의 (?![ \t]*[:：]) : 성적 뒤에 콜론이 오면(= 등급 평점 범례 "A : 4.0") 제외
const TOKEN_RE = new RegExp(
  "(\\d(?:\\.\\d)?)[\\s,\\t]+" + GRADE_PATTERN + "(?=[\\s,\\t]|$)(?![ \\t]*[:：])",
  "gi"
);

// 과목으로 안 잡고 건너뛸 성적
// W = 재수강(성적 미반영) → 실제 이수 과목 아님 (경계로만 사용)
const SKIP_GRADES = new Set(["W"]);

// 이수구분 약어들 (과목명 앞에 붙음)
const DIVISIONS = [
  "전공필수", "전공선택", "교양필수", "교양선택", "일반선택",
  "전기", "전선", "전필", "교선", "교필", "일선", "일필",
  "부필", "부선", "복필", "복선", "연필", "연선",
  "교직", "채플", "공통", "필수", "선택",
];
const DIVISION_RE = new RegExp("^\\s*(" + DIVISIONS.join("|") + ")\\s+");

// 성적 표기 정규화 (A0 -> A, FA/NP -> F, "A +" -> "A+" 등)
function normalizeGrade(g) {
  const up = g.replace(/\s+/g, "").toUpperCase(); // 내부 공백 제거 (OCR 대비)
  if (up === "A0") return "A";
  if (up === "B0") return "B";
  if (up === "C0") return "C";
  if (up === "D0") return "D";
  if (up === "FA" || up === "NP") return "F"; // 미이수/유고결석은 F로
  return up; // A+, A, B+, ... , F, P, W
}

// 과목명 앞에 붙는 군더더기(학기/이수구분/과목코드) 제거
function cleanName(raw) {
  let s = raw.trim();

  // 앞쪽 학기/연도 표기 제거 (예: 2024-1, 2024 학년도 1학기, 2024 1)
  s = s.replace(/^\s*\d{4}\s*[-.\/]?\s*\d?\s*(학년도)?\s*(\d\s*학기)?\s*(\(계절\))?\s*/, "");

  // 맨 앞 이수구분 제거
  s = s.replace(DIVISION_RE, "");

  // 과목코드 제거 (영문+숫자 조합, 예: CSE2001)
  s = s.replace(/^\s*[A-Za-z]{2,6}\d{2,6}[A-Za-z]?\s+/, "");

  // 숫자만으로 된 과목코드 제거
  s = s.replace(/^\s*\d{4,7}\s+/, "");

  // 코드 뒤에 이수구분이 또 올 수도 있어서 한 번 더
  s = s.replace(DIVISION_RE, "");

  // 끝에 남는 콤마/공백 정리 (콤마 구분 성적표 대비)
  s = s.replace(/[,\s]+$/, "");

  return s.trim();
}

// 한 줄 분석 → 과목 배열 (좌/우 2단이 합쳐진 줄이면 여러 개 나올 수 있음)
function parseLine(line) {
  const text = line.trim();
  if (!text) return [];

  const matches = [...text.matchAll(TOKEN_RE)];
  if (matches.length === 0) return [];

  const courses = [];
  let segStart = 0; // 직전 매칭이 끝난 위치 (다음 과목명 시작점)

  for (const m of matches) {
    const credit = Number(m[1]);
    const grade = normalizeGrade(m[2]);
    const rawName = text.slice(segStart, m.index);
    segStart = m.index + m[0].length; // 다음 과목명은 이 매칭 뒤부터

    if (SKIP_GRADES.has(grade)) continue; // W/U/S: 실제 과목 아님 (경계로만 사용)
    if (!(credit > 0 && credit <= 9)) continue; // 0학점(채플 등) 제외

    const name = cleanName(rawName);
    if (!name) continue;

    courses.push({ name, credit, grade });
  }

  return courses;
}

// 전체 텍스트 → 과목 배열
export function parseTranscript(text) {
  if (!text) return [];

  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    rows.push(...parseLine(line));
  }
  return rows;
}
