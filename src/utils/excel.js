// 엑셀(.xlsx/.xls/.csv) 성적표를 읽어서 텍스트로 바꿔주는 유틸 (SheetJS 사용)
// 표를 "탭으로 구분된 줄" 텍스트로 만들어, 기존 성적표 파서(parseTranscript)에 그대로 태움
import * as XLSX from "xlsx";

// 엑셀 File 객체 → 탭 구분 텍스트
export async function extractExcelText(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  let text = "";
  // 시트가 여러 개일 수도 있으니 전부 합침
  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    // header:1 → 각 행을 [셀, 셀, ...] 배열로
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      blankrows: false,
      defval: "",
    });

    rows.forEach((row) => {
      const line = row
        .map((cell) => (cell == null ? "" : String(cell).trim()))
        .join("\t");
      if (line.trim() !== "") text += line + "\n";
    });
  });

  return text;
}
