// src/api.js
const API = "http://localhost:8000";

// ----- Helper: parse JSON an toàn -----
async function safeParseJSON(res) {
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

// ----- Wrapper fetch -----
async function jsonFetch(url, opts = {}) {
  const init = { credentials: "include", ...opts };

  // Tự set Content-Type cho body JSON (không set cho FormData)
  if (init.body && !(init.body instanceof FormData)) {
    init.headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  }

  const res = await fetch(url, init);
  const data = await safeParseJSON(res);

  if (!res.ok) {
    throw new Error(
      (data && (data.detail || data.message || data.error)) || `HTTP ${res.status}`
    );
  }
  return data; // có thể là null nếu 204
}

// ================== API FUNCTIONS ==================

// Đăng nhập -> {code, name, role}
export async function login(code, password) {
  return jsonFetch(`${API}/login`, {
    method: "POST",
    body: JSON.stringify({ code, password }),
  });
}

// Upload ngân hàng câu hỏi (CSV) theo môn
export async function uploadBank(file, subject = "math") {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("subject", subject);

  const res = await fetch(`${API}/upload`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  const data = await safeParseJSON(res);
  if (!res.ok) throw new Error((data && data.detail) || "Upload lỗi");
  return data; // {ok, count, saved, subject}
}

// GV xem trước đề
export async function previewExams(
  n_questions,
  n_versions,
  seed = null,
  bank_path = null,
  subject = "math"
) {
  return jsonFetch(`${API}/exam/preview`, {
    method: "POST",
    body: JSON.stringify({ n_questions, n_versions, seed, bank_path, subject }),
  });
}

// GV xuất bản cấu hình đề thi
export async function publishExam({
  n_questions,
  n_versions,
  seed = null,
  bank_path = null,
  shuffle_questions = true,
  shuffle_options = true,
  subject = "math",
}) {
  return jsonFetch(`${API}/exam/publish`, {
    method: "POST",
    body: JSON.stringify({
      n_questions,
      n_versions,
      seed,
      bank_path,
      shuffle_questions,
      shuffle_options,
      subject,
    }),
  });
}

// HS bắt đầu làm bài (chú ý truyền subject nếu có màn chọn môn)
export async function startExam(student_code, subject = "math") {
  return jsonFetch(`${API}/exam/start`, {
    method: "POST",
    body: JSON.stringify({ student_code, subject }),
  });
}

// HS nộp bài
export async function submitExam(session_id, answers) {
  return jsonFetch(`${API}/exam/submit`, {
    method: "POST",
    body: JSON.stringify({ session_id, answers }),
  });
}
// KẾT QUẢ THI (GV) 
export async function listResults({ student_code = "", subject = "" } = {}) {
  const qs = new URLSearchParams();
  if (student_code) qs.set("student_code", student_code);
  if (subject) qs.set("subject", subject);
  const q = qs.toString();
  return jsonFetch(`${API}/results${q ? `?${q}` : ""}`, { method: "GET" });
}

export async function getResultDetail(session_id) {
  return jsonFetch(`${API}/results/session/${session_id}`, { method: "GET" });
}
// ================== UPLOAD LIST CRUD ==================

// Lấy danh sách bài thi đã upload
export async function listUploadedExams() {
    return jsonFetch(`${API}/uploads`, { method: "GET" });
}

// Thêm (tải lên) 1 bài thi mới (file hoặc metadata)
export async function createUploadedExam(formData) {
    // formData có thể chứa file hoặc thông tin khác
    const res = await fetch(`${API}/uploads`, {
        method: "POST",
        credentials: "include",
        body: formData,
    });
    const data = await safeParseJSON(res);
    if (!res.ok) throw new Error(data?.detail || "Upload lỗi");
    return data;
}

// Cập nhật thông tin bài thi (ví dụ tên, mô tả...)
export async function updateUploadedExam(id, payload) {
    return jsonFetch(`${API}/uploads/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

// Xóa bài thi
export async function deleteUploadedExam(id) {
    return jsonFetch(`${API}/uploads/${id}`, { method: "DELETE" });
}

// ================== LỊCH SỬ TRỘN ĐỀ ==================

export async function listMixedExams(limit = 50) {
  return jsonFetch(`${API}/exam/mixed-history?limit=${limit}`, {
    method: "GET",
  });
}
export async function getMixedExamDetail(id) {
  return jsonFetch(`${API}/exam/mixed-history/${id}`, {
    method: "GET",
  });
}

export async function deleteMixedExam(id) {
  return jsonFetch(`${API}/exam/mixed-history/${id}`, {
    method: "DELETE",
  });
}

// ================== QUẢN LÝ NGƯỜI DÙNG ==================
export async function listUsers() {
  return jsonFetch(`${API}/users`, { method: "GET" });
}

export async function registerUser(payload) {
  return jsonFetch(`${API}/users/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function approveUser(id) {
  return jsonFetch(`${API}/users/${id}/approve`, { method: "PUT" });
}

export async function rejectUser(id) {
  return jsonFetch(`${API}/users/${id}/reject`, { method: "PUT" });
}

export async function updateUser(id, payload) {
  return jsonFetch(`${API}/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(id) {
  return jsonFetch(`${API}/users/${id}`, { method: "DELETE" });
}

export async function createUserByAdmin(payload) {
  return jsonFetch(`${API}/users`, {
    method: "POST",
    body: JSON.stringify({
      code: payload.code,
      name: payload.name,
      password: payload.password,
      email: payload.email,
      role: payload.role || "student",
    }),
  });
}
