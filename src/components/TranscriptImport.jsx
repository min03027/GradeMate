import { useState } from "react";
import { parseTranscript } from "../utils/transcript.js";

// 미리보기 표에서 고를 수 있는 성적 (P = 패스과목, GPA엔 안 들어감)
const gradeOptions = ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F", "P"];

// 성적표(텍스트/PDF)를 넣으면 과목들을 한꺼번에 불러오는 곳
function TranscriptImport({ onAddMany }) {
  const [text, setText] = useState(""); // 붙여넣은/추출한 성적표 텍스트
  const [rows, setRows] = useState([]); // 분석 결과 (수정 가능)
  const [analyzed, setAnalyzed] = useState(false); // 분석 한번 했는지
  const [replace, setReplace] = useState(true); // 기존 과목 비우고 넣을지
  const [busy, setBusy] = useState(false); // 파일에서 글자 뽑는 중
  const [busyMsg, setBusyMsg] = useState(""); // 진행 상황 메시지
  const [fileError, setFileError] = useState("");

  // PDF/이미지 파일 1개에서 글자 추출해서 입력칸에 이어붙임 (파일선택/붙여넣기 공용)
  const processFile = async (file) => {
    if (!file) return;

    setBusy(true);
    setFileError("");
    setBusyMsg("파일 읽는 중…");

    try {
      let extracted = "";
      const isPdf =
        file.type === "application/pdf" ||
        (file.name || "").toLowerCase().endsWith(".pdf");

      if (isPdf) {
        // pdf.js는 용량이 커서 필요할 때만 동적으로 불러옴
        setBusyMsg("PDF 읽는 중…");
        const { extractPdfText } = await import("../utils/pdf.js");
        extracted = await extractPdfText(file);
      } else if ((file.type || "").startsWith("image/")) {
        // tesseract.js OCR도 무거워서 이미지 올릴 때만 동적으로 불러옴
        setBusyMsg("이미지 인식 준비 중…");
        const { extractImageText } = await import("../utils/ocr.js");
        extracted = await extractImageText(file, (status, progress) => {
          setBusyMsg(`이미지 인식 중… ${Math.round(progress * 100)}%`);
        });
      } else {
        setFileError("PDF 또는 이미지 파일만 인식할 수 있어요.");
        return;
      }

      // 여러 장(예: 2페이지 성적표) 올릴 수 있게 기존 내용에 이어붙임
      setText((prev) => (prev.trim() ? prev + "\n" + extracted : extracted));
    } catch (err) {
      console.error(err);
      setFileError(
        "파일에서 글자를 읽지 못했습니다. 스캔/사진 화질이 낮으면 인식이 어려울 수 있어요. 내용을 직접 복사해 붙여넣어 주세요."
      );
    } finally {
      setBusy(false);
      setBusyMsg("");
    }
  };

  // 파일 선택 버튼으로 올렸을 때
  const handleFile = async (e) => {
    await processFile(e.target.files[0]);
    e.target.value = ""; // 같은 파일 다시 선택 가능하게 초기화
  };

  // 입력칸에 붙여넣기(Ctrl/Cmd+V) 했을 때
  // - 클립보드에 "이미지"가 있으면 (스크린샷 등) → OCR 처리
  // - 일반 텍스트면 → 그냥 평소대로 붙여넣기
  const handlePaste = (e) => {
    if (busy) return;
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;

    for (const item of items) {
      if (item.type && item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (blob) {
          e.preventDefault(); // 이미지는 텍스트영역에 안 들어가니 막고 OCR로
          processFile(blob);
          return;
        }
      }
    }
    // 이미지가 없으면 기본 텍스트 붙여넣기 동작 그대로 둠
  };

  // "분석하기" → 텍스트 파싱
  const handleAnalyze = () => {
    setRows(parseTranscript(text));
    setAnalyzed(true);
  };

  // 미리보기 표의 한 칸 수정
  const updateRow = (index, key, value) => {
    setRows(rows.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  };

  // 미리보기 행 삭제
  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  // 빈 행 추가 (수기로 보충용)
  const addEmptyRow = () => {
    setRows([...rows, { name: "", credit: 3, grade: "A+" }]);
  };

  // "추가하기" → 유효한 행만 골라서 App에 넘김
  const handleSubmit = () => {
    const valid = rows
      .map((r) => ({
        name: String(r.name).trim(),
        credit: Number(r.credit),
        grade: r.grade,
      }))
      .filter((r) => r.name !== "" && r.credit > 0);

    if (valid.length === 0) {
      alert("추가할 과목이 없습니다. 표 내용을 확인해주세요.");
      return;
    }

    onAddMany(valid, replace);

    // 끝났으니 입력칸/표 비우기
    setText("");
    setRows([]);
    setAnalyzed(false);
  };

  return (
    <div className="transcript-import">
      <h2>성적표 불러오기</h2>

      <p className="ti-help">
        성적표 PDF나 캡처 이미지를 올리면 과목이 자동으로 정리됩니다. 이미지를
        복사한 뒤 아래 입력칸에 <b>붙여넣기(Ctrl/⌘+V)</b> 해도 OCR로 인식돼요.
        포털/PDF의 과목 글자를 복사해 붙여넣어도 됩니다.
      </p>

      {/* PDF / 이미지 업로드 */}
      <div className="ti-pdf-row">
        <label className="ti-pdf-button">
          📄 파일 선택 (PDF·이미지)
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={handleFile}
            disabled={busy}
            hidden
          />
        </label>
        {busy && <span className="ti-loading">{busyMsg}</span>}
      </div>
      {fileError && <p className="ti-error">{fileError}</p>}

      {/* 텍스트 붙여넣기 */}
      <textarea
        className="ti-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={handlePaste}
        placeholder={
          "여기에 성적표 글자를 붙여넣거나, 캡처 이미지를 붙여넣으세요(Ctrl/⌘+V).\n\n예시)\n자료구조  3  A+\n운영체제  3  B+\n현대사회와 윤리  2  P"
        }
        rows={6}
      />

      <button
        type="button"
        className="ti-analyze-button"
        onClick={handleAnalyze}
        disabled={text.trim() === ""}
      >
        분석하기
      </button>

      {/* 분석 결과 미리보기 표 */}
      {analyzed && (
        <div className="ti-preview">
          {rows.length === 0 ? (
            <p className="ti-empty">
              인식된 과목이 없습니다. 형식을 확인하거나 아래에서 직접 추가해
              주세요.
            </p>
          ) : (
            <p className="ti-count">
              {rows.length}개 과목을 찾았어요. 내용을 확인하고 고친 뒤 추가하세요.
            </p>
          )}

          <div className="ti-table">
            <div className="ti-table-head">
              <span className="ti-col-name">과목명</span>
              <span className="ti-col-credit">학점</span>
              <span className="ti-col-grade">성적</span>
              <span className="ti-col-del"></span>
            </div>

            {rows.map((row, i) => (
              <div className="ti-table-row" key={i}>
                <input
                  className="ti-col-name"
                  type="text"
                  value={row.name}
                  onChange={(e) => updateRow(i, "name", e.target.value)}
                  placeholder="과목명"
                />
                <input
                  className="ti-col-credit"
                  type="number"
                  min="1"
                  max="9"
                  value={row.credit}
                  onChange={(e) => updateRow(i, "credit", e.target.value)}
                />
                <select
                  className="ti-col-grade"
                  value={row.grade}
                  onChange={(e) => updateRow(i, "grade", e.target.value)}
                >
                  {gradeOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="ti-row-del"
                  onClick={() => removeRow(i)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button type="button" className="ti-addrow-button" onClick={addEmptyRow}>
            + 행 추가
          </button>

          {/* 기존 과목 처리 옵션 */}
          <label className="ti-replace">
            <input
              type="checkbox"
              checked={replace}
              onChange={(e) => setReplace(e.target.checked)}
            />
            불러오기 전에 기존 과목 모두 지우기
          </label>

          <button type="button" className="ti-submit-button" onClick={handleSubmit}>
            {rows.length > 0 ? `${rows.length}개 과목 추가하기` : "과목 추가하기"}
          </button>
        </div>
      )}
    </div>
  );
}

export default TranscriptImport;
