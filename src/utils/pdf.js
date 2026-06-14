// PDF 성적표 파일에서 텍스트를 뽑아주는 유틸 (pdf.js 사용, 전부 브라우저에서 처리)
// 1차: PDF 안의 글자 레이어를 그대로 추출
// 2차: 글자가 없으면(스캔/이미지 PDF) 페이지를 그려서 OCR
import * as pdfjsLib from "pdfjs-dist";
// Vite가 worker 파일을 정적 URL로 만들어줌
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

// PDF는 줄 개념이 없어서, 글자들의 y좌표가 비슷하면 같은 줄로 묶어 줄바꿈을 복원함
function itemsToLines(items) {
  const pieces = items
    .filter((it) => it.str && it.str.trim() !== "")
    .map((it) => ({ x: it.transform[4], y: it.transform[5], str: it.str }));

  // 위에서 아래로(y 큰 순), 같은 줄이면 왼쪽에서 오른쪽으로(x 작은 순)
  pieces.sort((a, b) => {
    if (Math.abs(a.y - b.y) > 3) return b.y - a.y;
    return a.x - b.x;
  });

  let text = "";
  let prevY = null;
  for (const p of pieces) {
    if (prevY === null) {
      text += p.str;
    } else if (Math.abs(p.y - prevY) <= 3) {
      text += " " + p.str; // 같은 줄
    } else {
      text += "\n" + p.str; // 줄 바뀜
    }
    prevY = p.y;
  }
  return text;
}

// 글자 레이어가 없는 PDF → 각 페이지를 캔버스에 그려서 OCR
async function ocrPdfPages(pdf, onProgress) {
  const { extractImageText } = await import("./ocr.js");

  let fullText = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 }); // 크게 그려야 OCR 정확도↑

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");

    await page.render({ canvasContext: ctx, viewport }).promise;

    const text = await extractImageText(canvas, (status, progress) => {
      if (onProgress) onProgress(status, progress, pageNum, pdf.numPages);
    });
    fullText += text + "\n";
  }
  return fullText;
}

// PDF File 객체 → 전체 텍스트
export async function extractPdfText(file, onProgress) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let fullText = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    fullText += itemsToLines(content.items) + "\n";
  }

  // 글자가 거의 없으면 스캔/이미지 PDF로 보고 OCR로 다시 시도
  if (fullText.replace(/\s/g, "").length < 10) {
    return await ocrPdfPages(pdf, onProgress);
  }

  return fullText;
}
