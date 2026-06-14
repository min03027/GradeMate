// 성적표 텍스트를 분석해서 과목 목록으로 바꿔주는 파서
// 형식이 학교/포털마다 달라서 "한 줄에 [과목명 ... 학점 성적]" 패턴을 최대한 유연하게 찾음
// (완벽하진 않으니 화면에서 미리보기 표로 보여주고 사용자가 고칠 수 있게 함)

// 인식 가능한 성적 토큰 (A0=A 처럼 0 붙는 표기도 처리)
const GRADE_PATTERN = "(A\\+|A0|A|B\\+|B0|B|C\\+|C0|C|D\\+|D0|D|F|NP|P)";

// "학점(숫자) 성적" 이 붙어있는 패턴을 한 줄에서 찾음 (구분자는 공백/탭/콤마)
const CREDIT_GRADE_RE = new RegExp(
  "(\\d(?:\\.\\d)?)[\\s,\\t]+" + GRADE_PATTERN + "(?=[\\s,\\t]|$)",
  "gi"
);

// 성적 표기 정규화 (A0 -> A, NP -> F 등)
function normalizeGrade(g) {
  const up = g.toUpperCase();
  if (up === "A0") return "A";
  if (up === "B0") return "B";
  if (up === "C0") return "C";
  if (up === "D0") return "D";
  if (up === "NP") return "F"; // 미이수는 F로 취급
  return up; // A+, A, B+, ... , F, P
}

// 과목명 앞에 붙는 군더더기(학기/이수구분/과목코드) 제거
function cleanName(raw) {
  let s = raw.trim();

  // 앞쪽 학기/연도 표기 제거 (예: 2024-1, 2024 학년도 1학기, 2024 1)
  s = s.replace(/^\s*\d{4}\s*[-.\/]?\s*\d?\s*(학년도)?\s*(\d\s*학기)?\s*/, "");

  // 맨 앞 이수구분 제거
  s = s.replace(
    /^\s*(전공필수|전공선택|교양필수|교양선택|일반선택|전선|전필|교선|교필|일선|공통|필수|선택|P\/F)\s+/,
    ""
  );

  // 과목코드 제거 (영문+숫자 조합)
  s = s.replace(/^\s*[A-Za-z]{2,6}\d{2,6}[A-Za-z]?\s+/, "");

  // 숫자만으로 된 과목코드 제거
  s = s.replace(/^\s*\d{4,7}\s+/, "");

  // 코드 뒤에 이수구분이 또 올 수도 있어서 한 번 더
  s = s.replace(
    /^\s*(전공필수|전공선택|교양필수|교양선택|일반선택|전선|전필|교선|교필|일선|필수|선택)\s+/,
    ""
  );

  // 끝에 남는 콤마/공백 정리 (콤마 구분 성적표 대비)
  s = s.replace(/[,\s]+$/, "");

  return s.trim();
}

// 한 줄 분석 → 성공하면 {name, credit, grade}, 실패하면 null
function parseLine(line) {
  const text = line.trim();
  if (!text) return null;

  // "학점 성적" 패턴들 다 찾아서, 줄 맨 뒤쪽(과목 성적일 확률 높음) 것을 사용
  const matches = [...text.matchAll(CREDIT_GRADE_RE)];
  if (matches.length === 0) return null;

  const last = matches[matches.length - 1];
  const credit = Number(last[1]);
  const grade = normalizeGrade(last[2]);

  // 학점 범위가 이상하면 (예: 연도 19xx) 거름
  if (!(credit > 0 && credit <= 9)) return null;

  // 과목명 = 매칭된 "학점" 앞부분
  const name = cleanName(text.slice(0, last.index));
  if (!name) return null;

  return { name, credit, grade };
}

// 전체 텍스트 → 과목 배열
export function parseTranscript(text) {
  if (!text) return [];

  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const parsed = parseLine(line);
    if (parsed) rows.push(parsed);
  }
  return rows;
}
