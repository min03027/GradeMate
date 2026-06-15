import { calcGPA, calcMajorGPA, calcEarnedCredit } from "../utils/credit.js";

// 평균학점이랑 이수학점 계산해서 보여주는 곳
function GPAResult({ subjects }) {
  // 계산은 공용 유틸에 맡김 (재수강/학점포기/F 처리 다 포함됨)
  const gpa = calcGPA(subjects);
  const majorGpa = calcMajorGPA(subjects);
  const totalCredit = calcEarnedCredit(subjects);

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
          <p className="result-label">전공 평점</p>
          <p className="result-value">{majorGpa.toFixed(2)}</p>
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
