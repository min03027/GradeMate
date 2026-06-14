// 학번별 프로필을 브라우저(localStorage)에 저장/불러오기
// 구조: { lastStudentId, profiles: { [학번]: { name, setup, subjects, checklist } } }
// ※ 실제 보안 인증이 아니라 "이 기기 안에서 학번으로 데이터를 구분/저장"하는 용도

const KEY = "grademate";

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function write(store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // 사생활 보호 모드 등으로 저장 불가 → 그냥 무시 (메모리로만 동작)
  }
}

// 특정 학번 프로필 가져오기 (없으면 null)
export function loadProfile(studentId) {
  const store = read();
  return (store.profiles && store.profiles[studentId]) || null;
}

// 특정 학번 프로필 저장 (기존 값과 병합)
export function saveProfile(studentId, data) {
  const store = read();
  if (!store.profiles) store.profiles = {};
  store.profiles[studentId] = { ...store.profiles[studentId], ...data };
  store.lastStudentId = studentId;
  write(store);
}

// 저장된 프로필 목록 (이어서 하기용)
export function listProfiles() {
  const store = read();
  if (!store.profiles) return [];
  return Object.keys(store.profiles).map((id) => ({
    studentId: id,
    name: store.profiles[id].name || "",
  }));
}

// 마지막으로 쓰던 학번 (자동 로그인용)
export function getLastStudentId() {
  return read().lastStudentId || null;
}

// 로그아웃: 마지막 학번 기록만 지움 (데이터는 보존)
export function clearLast() {
  const store = read();
  delete store.lastStudentId;
  write(store);
}

// 프로필 완전 삭제
export function deleteProfile(studentId) {
  const store = read();
  if (store.profiles) delete store.profiles[studentId];
  if (store.lastStudentId === studentId) delete store.lastStudentId;
  write(store);
}
