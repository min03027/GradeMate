// 성적별 점수표
const gradePointMap = {
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
function getLatestSubjects(subjects) {
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

// 평균학점이랑 이수학점 계산해서 보여주는 곳
function GPAResult({ subjects }) {
  // 일단 재수강부터 정리 (같은 과목은 최근것만)
  const latestSubjects = getLatestSubjects(subjects);

  // 학점포기한건 계산에서 빼기
  const gpaTargets = latestSubjects.filter((s) => !s.dropped);

  // 평균학점 계산: (점수 * 학점) 다 더해서 / 학점합
  let totalPoint = 0;
  let gpaCredit = 0;

  gpaTargets.forEach((s) => {
    totalPoint += gradePointMap[s.grade] * s.credit;
    gpaCredit += s.credit;
  });

  // 과목 없을때 0으로 나누면 NaN 떠서 막아줌
  const gpa = gpaCredit === 0 ? 0 : totalPoint / gpaCredit;

  // 총 이수학점: F는 이수 못한거니까 빼고 학점만 더하기
  const earnedSubjects = gpaTargets.filter((s) => s.grade !== "F");
  let totalCredit = 0;
  earnedSubjects.forEach((s) => {
    totalCredit += s.credit;
  });

  return (
    <div className="gpa-result">
      <h2>학점 결과</h2>
      <div className="result-cards">
        <div className="result-card">
          <p className="result-label">평균 학점 (GPA)</p>
          {/* 소수점 둘째자리까지만 */}
          <p className="result-value">{gpa.toFixed(2)}</p>
          <p className="result-sub">/ 4.5</p>
        </div>
        <div className="result-card">
          <p className="result-label">총 이수 학점</p>
          <p className="result-value">{totalCredit}</p>
          <p className="result-sub">학점</p>
        </div>
      </div>
    </div>
  );
}

export default GPAResult;
