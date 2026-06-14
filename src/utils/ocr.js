// 성적표 "이미지"에서 글자를 뽑아주는 유틸 (tesseract.js OCR, 전부 브라우저에서 처리)
// 한글+영어 인식. 처음 한 번은 언어 데이터를 내려받아 조금 느릴 수 있음.
import Tesseract from "tesseract.js";

// 이미지 File 객체 → 인식된 텍스트
// onProgress(status, progress) : 진행 상황 콜백 (progress 0~1)
export async function extractImageText(file, onProgress) {
  const worker = await Tesseract.createWorker("kor+eng", 1, {
    logger: (m) => {
      if (onProgress && typeof m.progress === "number") {
        onProgress(m.status, m.progress);
      }
    },
  });

  try {
    const { data } = await worker.recognize(file);
    return data.text;
  } finally {
    await worker.terminate();
  }
}
