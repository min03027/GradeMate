// 구버전 브라우저 호환용 폴리필
// pdfjs-dist(v4+)나 tesseract.js가 Promise.withResolvers 를 쓰는데,
// 2023년 말 이전 브라우저엔 없어서 PDF/OCR이 바로 깨짐 → 직접 채워줌.
if (typeof Promise.withResolvers !== "function") {
  Promise.withResolvers = function () {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}
