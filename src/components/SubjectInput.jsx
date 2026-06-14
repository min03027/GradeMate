import { useState } from "react";
import SubjectForm from "./SubjectForm.jsx";
import TranscriptImport from "./TranscriptImport.jsx";

// 과목 입력 방식 선택 (직접 입력 / 성적표 불러오기) 탭
function SubjectInput({ onAdd, onAddMany, maxGrade }) {
  const [tab, setTab] = useState("manual"); // "manual" | "transcript"

  return (
    <div className="subject-input">
      {/* 탭 버튼 */}
      <div className="input-tabs">
        <button
          type="button"
          className={"input-tab" + (tab === "manual" ? " active" : "")}
          onClick={() => setTab("manual")}
        >
          ✏️ 직접 입력
        </button>
        <button
          type="button"
          className={"input-tab" + (tab === "transcript" ? " active" : "")}
          onClick={() => setTab("transcript")}
        >
          📋 성적표 불러오기
        </button>
      </div>

      {/* 선택된 탭에 맞는 입력 화면 */}
      {tab === "manual" ? (
        <SubjectForm onAdd={onAdd} maxGrade={maxGrade} />
      ) : (
        <TranscriptImport onAddMany={onAddMany} />
      )}
    </div>
  );
}

export default SubjectInput;
