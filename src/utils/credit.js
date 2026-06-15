// 학점 계산 관련 공용 함수들 (GPAResult, GraduationRequirement 에서 같이 씀)

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

// 주어진 과목들로 평균학점 계산: (점수 * 학점) 다 더해서 / 학점합
function gpaOf(targets) {
  let totalPoint = 0;
  let gpaCredit = 0;

  targets.forEach((s) => {
    const point = gradePointMap[s.grade];
    // P(패스) 처럼 평점이 없는 과목은 GPA 계산에서 제외
    if (typeof point !== "number") return;
    totalPoint += point * s.credit;
    gpaCredit += s.credit;
  });

  // 과목 없을때 0으로 나누면 NaN 떠서 막아줌
  return gpaCredit === 0 ? 0 : totalPoint / gpaCredit;
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

// 총 이수학점: F는 이수 못한거니까 빼고 학점만 더하기
export function calcEarnedCredit(subjects) {
  const earned = getValidSubjects(subjects).filter((s) => s.grade !== "F");

  let totalCredit = 0;
  earned.forEach((s) => {
    totalCredit += s.credit;
  });

  return totalCredit;
}

// 전공/교양 이수학점 합계 (전공이 아니면 모두 교양으로 합산)
export function calcEarnedByCategory(subjects) {
  const earned = getValidSubjects(subjects).filter((s) => s.grade !== "F");

  const sum = { major: 0, liberal: 0 };
  earned.forEach((s) => {
    if (s.category === "major" || !s.category) sum.major += s.credit;
    else sum.liberal += s.credit;
  });

  return sum;
}
