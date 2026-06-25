// 학점 계산 관련 공용 함수들 (GPAResult, GraduationRequirement 에서 같이 씀)

import { semesterSortKey } from "./semester.js";

// 성적별 점수표
export const gradePointMap = {
  "A+": 4.5,
  A: 4.0,
  "B+": 3.5,
  B: 3.0,
  "C+": 2.5,
  C: 2.0,
  "D+": 1.5,
  D: 1.0,
  F: 0,
};

// 채플인지 판별 (공백 무시, 영문도 허용)
export function isChapel(name) {
  if (!name) return false;
  const n = name.replace(/\s/g, "").toLowerCase();
  return n.includes("채플") || n.includes("chapel");
}

// 채플처럼 학교 규정상 여러 번 이수해야 하는 과목 → 재수강/중복으로 보면 안 됨
export function isRepeatableCourse(name) {
  return isChapel(name);
}

// 이수한 채플 횟수 (학기마다 같은 이름으로 입력 → 각각 1회로 카운트)
// 학점포기·F는 이수로 안 봄
export function countChapel(subjects) {
  return subjects.filter(
    (s) => isChapel(s.name) && !s.dropped && s.grade !== "F"
  ).length;
}

// 같은 과목명 여러개면 제일 최근거(id 큰거)만 남기기 = 재수강 반영
// 단, 채플 같은 반복 이수 과목은 합치지 않고 전부 그대로 둠
export function getLatestSubjects(subjects) {
  const latestMap = {};
  const repeatables = [];

  subjects.forEach((s) => {
    // 채플 등은 매번 따로 인정
    if (isRepeatableCourse(s.name)) {
      repeatables.push(s);
      return;
    }
    const saved = latestMap[s.name];
    // 같은 이름 없거나, 이번게 더 최근이면 바꿔치기
    if (!saved || s.id > saved.id) {
      latestMap[s.name] = s;
    }
  });

  return [...Object.values(latestMap), ...repeatables];
}

// 재수강 정리 + 학점포기 제외한 "유효 과목들"
export function getValidSubjects(subjects) {
  return getLatestSubjects(subjects).filter((s) => !s.dropped);
}

// 재수강으로 밀려난(같은 이름의 더 최근 과목이 있는) 옛 과목들의 id 모음
// → 성적 미반영(W) 처리 대상. 채플 등 반복 이수 과목은 제외.
export function getSupersededIds(subjects) {
  const latestId = {}; // 과목명 → 가장 최근(id 큰) 과목 id
  subjects.forEach((s) => {
    if (isRepeatableCourse(s.name)) return;
    if (latestId[s.name] == null || s.id > latestId[s.name]) {
      latestId[s.name] = s.id;
    }
  });

  const set = new Set();
  subjects.forEach((s) => {
    if (isRepeatableCourse(s.name)) return;
    // 더 최근 과목이 따로 있으면(자기가 최신이 아니면) 재수강으로 밀려난 과목
    if (latestId[s.name] != null && s.id !== latestId[s.name]) set.add(s.id);
  });
  return set;
}

// 주어진 과목들의 평점 합계 구하기 (누적 점수·학점·평점)
// P(패스)처럼 평점 없는 과목은 제외
function gpaSum(targets) {
  let totalPoint = 0;
  let gpaCredit = 0;

  targets.forEach((s) => {
    const point = gradePointMap[s.grade];
    if (typeof point !== "number") return;
    totalPoint += point * s.credit;
    gpaCredit += s.credit;
  });

  // 과목 없을때 0으로 나누면 NaN 떠서 막아줌
  const gpa = gpaCredit === 0 ? 0 : totalPoint / gpaCredit;
  return { totalPoint, gpaCredit, gpa };
}

function gpaOf(targets) {
  return gpaSum(targets).gpa;
}

// 현재 평점 누적치 (시뮬레이션 등에서 현재 점수·학점이 필요할 때)
export function gpaStats(subjects) {
  return gpaSum(getValidSubjects(subjects));
}

// 전체 평균학점(GPA)
export function calcGPA(subjects) {
  return gpaOf(getValidSubjects(subjects));
}

// 전공 평균학점: 전공 과목만 골라서 계산 (구분 없으면 전공으로 봄)
export function calcMajorGPA(subjects) {
  const majors = getValidSubjects(subjects).filter(
    (s) => s.category === "major" || !s.category
  );
  return gpaOf(majors);
}

// 과목을 학기별로 묶기 → { semester, subjects } 배열 (학기 빠른 순, 미지정은 맨 뒤)
export function groupBySemester(subjects) {
  const map = {};
  subjects.forEach((s) => {
    const key = s.semester && s.semester.trim() ? s.semester : "";
    if (!map[key]) map[key] = [];
    map[key].push(s);
  });

  return Object.keys(map)
    .sort((a, b) => {
      const ka = semesterSortKey(a);
      const kb = semesterSortKey(b);
      return ka < kb ? -1 : ka > kb ? 1 : 0;
    })
    .map((semester) => ({ semester, subjects: map[semester] }));
}

// 학기별 평점 (선그래프용). 평점 낼 과목이 있는 학기만, 미지정 학기는 제외
export function calcGPABySemester(subjects) {
  return groupBySemester(subjects)
    .filter((g) => g.semester) // 학기 미지정은 그래프에서 빼기
    .map((g) => ({
      semester: g.semester,
      gpa: calcGPA(g.subjects),
      // 평점 낼(점수 있는) 과목이 하나라도 있는 학기만
      hasGraded: g.subjects.some(
        (s) => !s.dropped && typeof gradePointMap[s.grade] === "number"
      ),
    }))
    .filter((g) => g.hasGraded);
}

// 총 이수학점: F는 이수 못한거니까 빼고 학점만 더하기
export function calcEarnedCredit(subjects) {
  const earned = getValidSubjects(subjects).filter((s) => s.grade !== "F");

  let totalCredit = 0;
  earned.forEach((s) => {
    totalCredit += s.credit;
  });

  return totalCredit;
}

// 목표 평점 도달에 필요한 "성적별 최소 과목 수" 시뮬레이션
// 실제 과목/학점 데이터는 안 건드리고 계산만 함 (저장 X)
// 가정: 앞으로 듣는 과목을 전부 같은 성적으로 받고, 한 과목당 creditPerCourse 학점
export function simulateTargetGPA(subjects, target, creditPerCourse = 3) {
  const { totalPoint, gpaCredit, gpa } = gpaStats(subjects);
  const alreadyMet = gpaCredit > 0 && gpa >= target;

  // 시뮬레이션에 쓸 성적들 (높은 순)
  const GRADES = [
    { grade: "A+", point: 4.5 },
    { grade: "A", point: 4.0 },
    { grade: "B+", point: 3.5 },
    { grade: "B", point: 3.0 },
  ];

  const results = GRADES.map(({ grade, point }) => {
    // 이미 목표 넘었으면 더 들을 필요 없음
    if (alreadyMet) return { grade, point, count: 0, possible: true };

    // 목표보다 낮거나 같은 성적만으론 평균을 목표까지 못 끌어올림
    if (point <= target) return { grade, point, count: null, possible: false };

    // (현재점수 + point*c*k) / (현재학점 + c*k) >= target  →  k 풀기
    const need = target * gpaCredit - totalPoint; // 부족한 (평점*학점)
    let k = Math.ceil(need / (creditPerCourse * (point - target)));
    if (k < 1) k = 1; // 최소 1과목
    return { grade, point, count: k, possible: true };
  });

  return { currentGPA: gpa, hasGrades: gpaCredit > 0, alreadyMet, results };
}

// 평점(point) 이상을 만족하는 가장 낮은 letter 등급 (필요 평균 표기용)
const GRADE_SCALE = [
  { grade: "D", point: 1.0 },
  { grade: "D+", point: 1.5 },
  { grade: "C", point: 2.0 },
  { grade: "C+", point: 2.5 },
  { grade: "B", point: 3.0 },
  { grade: "B+", point: 3.5 },
  { grade: "A", point: 4.0 },
  { grade: "A+", point: 4.5 },
];

export function gradeForPoint(point) {
  if (point > 4.5) return null; // 불가능
  const found = GRADE_SCALE.find((g) => g.point >= point - 1e-9);
  return found ? found.grade : "A+";
}

// 앞으로 n과목(각 creditPerCourse 학점) 들을 때, 목표 도달에 필요한 "평균 평점"
export function requiredAvgForCourses(subjects, target, creditPerCourse, n) {
  if (!n || n <= 0) return null;
  const { totalPoint, gpaCredit } = gpaStats(subjects);
  const addCredit = creditPerCourse * n;
  // (현재점수 + p*추가학점) / (현재학점 + 추가학점) = target  →  p
  const point = (target * (gpaCredit + addCredit) - totalPoint) / addCredit;
  return {
    point,
    possible: point <= 4.5,
    trivial: point <= 0, // 0 이하면 사실상 어떤 성적이든 목표 달성
    grade: gradeForPoint(point),
  };
}

// 구분별 이수학점 합계 (주전공/다전공/교양/자유)
export function calcEarnedByCategory(subjects) {
  const earned = getValidSubjects(subjects).filter((s) => s.grade !== "F");

  const sum = { major: 0, second: 0, liberal: 0, free: 0 };
  earned.forEach((s) => {
    const c = s.category || "major";
    if (c === "second") sum.second += s.credit;
    else if (c === "liberal") sum.liberal += s.credit;
    else if (c === "free") sum.free += s.credit;
    else sum.major += s.credit; // major 또는 미지정
  });

  return sum;
}
