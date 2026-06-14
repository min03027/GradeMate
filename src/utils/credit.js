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

// 같은 과목명 여러개면 제일 최근거(id 큰거)만 남기기 = 재수강 반영
export function getLatestSubjects(subjects) {
  const latestMap = {};

  subjects.forEach((s) => {
    const saved = latestMap[s.name];
    // 같은 이름 없거나, 이번게 더 최근이면 바꿔치기
    if (!saved || s.id > saved.id) {
      latestMap[s.name] = s;
    }
  });

  return Object.values(latestMap);
}

// 재수강 정리 + 학점포기 제외한 "유효 과목들"
export function getValidSubjects(subjects) {
  return getLatestSubjects(subjects).filter((s) => !s.dropped);
}

// 평균학점(GPA): (점수 * 학점) 다 더해서 / 학점합
export function calcGPA(subjects) {
  const targets = getValidSubjects(subjects);

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
