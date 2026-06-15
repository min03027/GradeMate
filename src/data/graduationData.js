// 삼육대학교 졸업 이수요건 데이터
// 학과(계열) × 입학유형(신입학/편입/전과)에 따라 졸업학점/교양/전공/자유학점이 달라짐
// (학교 졸업이수요건 표 기준. 전공학점은 단일전공=주전공 기준)

// 화면에 뿌릴 학과(계열) 목록
export const departments = [
  { id: "general", label: "일반 학과 (대부분의 학과)" },
  { id: "ai", label: "인공지능융합학부" },
  { id: "datacloud", label: "데이터클라우드공학과" },
  { id: "computer", label: "컴퓨터공학부" },
  { id: "arch", label: "건축학과 (5년제)" },
  { id: "pharm", label: "약학과 (6년제)" },
];

// 입학유형 목록
export const admissionTypes = [
  { id: "freshman", label: "신입학" },
  { id: "transfer", label: "편입학" },
  { id: "change", label: "전과" },
];

// 다전공(전공 이수 형태) 목록
export const multiTypes = [
  { id: "single", label: "단일전공" },
  { id: "double", label: "복수전공" },
  { id: "minor", label: "부전공" },
  { id: "linked", label: "연계전공" },
  { id: "micro", label: "마이크로전공" },
];

// 다전공(주전공 외) 이수학점 (학교 기본표 기준)
// 단일전공 주전공 학점에서 이 값을 빼면 다전공 시 주전공 학점이 됨
// 예) 인공지능 단일 85 → 복수전공이면 주전공 85-36=49, 복수전공 36
const SECOND_CREDITS = { single: 0, double: 36, minor: 21, linked: 36, micro: 12 };

// 다전공 신청 자격 (이수학기/평점). 마이크로는 평점 제한 없음
export const MULTI_REQS = {
  double: { semesters: 4, gpa: 2.5 },
  minor: { semesters: 1, gpa: 2.5 },
  linked: { semesters: 2, gpa: 2.5 },
  micro: { semesters: 1, gpa: 0 },
};

// 연계전공 목록 (참고용)
export const linkedMajors = [
  "미디어콘텐츠", "외식산업경영", "운동재활", "정원디자인",
  "한류콘텐츠", "SW중독심리", "SW중독재활", "보건빅데이터",
];

// 마이크로전공 목록 (참고용)
export const microMajors = [
  "외국인을 위한 한국어 과정", "항공서비스", "금연상담", "건강영양",
  "바이오의약", "데이터사이언스", "반도체", "AI·빅데이터분석",
  "백엔드SW개발", "시각미디어디자인", "사회복지기초", "스마트팜",
  "보건빅데이터", "스마트헬스케어", "글로컬리더십", "크리에이티브 컨버젼스",
  "기능성화장품", "바이오식품", "바이오의약품", "싱어송라이팅", "그린디자인",
];

// 다전공 신청 불가 학과 (간호·물리치료·약학·유아교육·건축5년제 등)
// 이 앱 학과 목록 기준: 건축(arch)·약학(pharm)은 신청 불가
export function allowsMultiMajor(deptId) {
  return deptId !== "arch" && deptId !== "pharm";
}

// 편입 cs계열 학번 선택지 (학번에 따라 졸업학점이 다름)
export const transferYears = [
  { id: "from23", label: "23학번 이후" },
  { id: "y22", label: "22학번" },
  { id: "upTo21", label: "21학번 이하" },
];

// 전과 학년 선택지 (전과한 학년에 따라 전공 이수학점이 다름)
export const transferGrades = [
  { id: "1", label: "1학년" },
  { id: "2", label: "2학년" },
  { id: "3", label: "3학년" },
  { id: "4", label: "4학년" },
];

// AI융합·데이터클라우드·컴퓨터공학부는 졸업요건이 같음 → "cs" 계열로 묶음
function groupOf(deptId) {
  if (deptId === "ai" || deptId === "datacloud" || deptId === "computer") {
    return "cs";
  }
  if (deptId === "arch") return "arch";
  if (deptId === "pharm") return "pharm";
  return "general";
}

// ---------- 신입학 졸업요건 (계열별) ----------
const FRESHMAN = {
  general: { total: 130, liberal: 39, major: 75, free: "7~16", chapel: 7 },
  cs: { total: 140, liberal: 39, major: 85, free: "7~16", chapel: 7 },
  arch: { total: 158, liberal: 39, major: 119, free: "0", chapel: 7 },
  pharm: { total: 240, liberal: 39, major: 201, free: "0", chapel: 7 },
};

// ---------- 편입학 졸업요건 (3학년 편입 기준) ----------
// cs계열은 학번에 따라 총 졸업학점이 다름(totalByYear)
const TRANSFER = {
  general: { total: 65, liberal: 6, major: 51, free: "0~11", chapel: 3 },
  cs: {
    total: null,
    liberal: 6,
    major: 61,
    free: "0~5",
    chapel: 3,
    totalByYear: { upTo21: 65, y22: 72, from23: 75 },
  },
  arch: { total: 102, liberal: 6, major: 86, free: "0~10", chapel: 3 },
  pharm: { total: 171, liberal: 6, major: 165, free: "0", chapel: 3 },
};

// ---------- 전과 졸업요건 ----------
// 총 졸업학점/교양은 신입학과 같고, 전공은 전과한 학년에 따라 달라짐(majorByGrade)
// 채플은 학교 규정상 전과생도 신입학과 동일하게 7회
const CHANGE = {
  general: {
    total: 130,
    liberal: 39,
    free: "0~16",
    chapel: 7,
    majorByGrade: { 1: 75, 2: 63, 3: 51, 4: 51 },
  },
  cs: {
    total: 140,
    liberal: 39,
    free: "0~16",
    chapel: 7,
    majorByGrade: { 1: 85, 2: 73, 3: 61, 4: 61 },
  },
  arch: { total: 158, liberal: 39, major: 119, free: "0", chapel: 7 },
  // 약학과(6년제)는 전과 대상이 아님 → 데이터 없음
};

// 선택값을 받아서 졸업요건 1개를 돌려줌
// 못 찾으면(예: 약학과 전과) null
export function getRequirement({ admission, deptId, transferYear, transferGrade }) {
  const group = groupOf(deptId);

  // 신입학
  if (admission === "freshman") {
    return { ...FRESHMAN[group] };
  }

  // 편입학
  if (admission === "transfer") {
    const base = TRANSFER[group];
    if (!base) return null;

    let total = base.total;
    // cs계열은 학번에 따라 총 졸업학점이 다름
    if (base.totalByYear) {
      total = base.totalByYear[transferYear] ?? base.totalByYear.from23;
    }
    return { ...base, total };
  }

  // 전과
  if (admission === "change") {
    const base = CHANGE[group];
    if (!base) return null; // 약학과 등 전과 불가 학과

    let major = base.major;
    // 전공은 전과한 학년에 따라 다름
    if (base.majorByGrade) {
      major = base.majorByGrade[transferGrade] ?? base.majorByGrade[4];
    }
    return { ...base, major };
  }

  return null;
}

// 전공 이수 계획: 단일/다전공에 따라 주전공·다전공 학점을 나눠서 돌려줌
// { type, typeLabel, primary, second, secondName }
export function getMajorPlan(setup) {
  const req = getRequirement(setup);
  if (!req) return null;

  const type = (setup && setup.multiType) || "single";
  const single = req.major; // 단일전공(주전공) 학점

  // 단일전공이거나 다전공 불가 학과면 그냥 단일
  if (type === "single" || !allowsMultiMajor(setup.deptId)) {
    return { type: "single", typeLabel: "단일전공", primary: single, second: 0 };
  }

  const second = SECOND_CREDITS[type] || 0;
  const primary = Math.max(0, single - second);
  const typeLabel =
    (multiTypes.find((t) => t.id === type) || {}).label || type;

  return {
    type,
    typeLabel,
    primary,
    second,
    secondName: (setup && setup.secondMajorName) || "",
  };
}

// 졸업에 필요한 이수학기 수 (건축 5년제 10학기, 약학 6년제 12학기, 그 외 8학기)
export function requiredSemesters(deptId) {
  if (deptId === "arch") return 10;
  if (deptId === "pharm") return 12;
  return 8;
}

// 이 학과가 cs계열인지 (편입 학번 입력칸 보여줄지 판단용)
export function isCsGroup(deptId) {
  return groupOf(deptId) === "cs";
}

// 전과 시 학년 선택이 필요한지 (전공이 학년별로 다른 계열만)
export function changeNeedsGrade(deptId) {
  const base = CHANGE[groupOf(deptId)];
  return !!(base && base.majorByGrade);
}
