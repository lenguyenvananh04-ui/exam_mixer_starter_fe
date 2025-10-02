// src/App.jsx
import { useState } from "react";
import Login from "./pages/Login.jsx";
import TeacherUpload from "./pages/TeacherUpload.jsx";
import { startExam, submitExam } from "./api.js";
import Results from "./pages/Results.jsx";
const letter = (i) => String.fromCharCode(65 + i);

const SUBJECTS = [
  { value: "math",       label: "Toán" },
  { value: "literature", label: "Văn" },
  { value: "english",    label: "Anh" },
];

export default function App() {
  const [user, setUser] = useState(null); // {code,name,role}

  // Chưa đăng nhập
  if (!user) return <Login onLogin={setUser} />;

  // Giáo viên
  if (user?.role === "teacher") {
    return <TeacherShell user={user} onLogout={() => setUser(null)} />;
  }

  // Học sinh
  if (user?.role === "student") {
    return <StudentExam user={user} onLogout={() => setUser(null)} />;
  }

  // Fallback
  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        Xin chào <b>{user?.name || "?"}</b> ({user?.code || "?"})
      </div>
      <p>Không xác định vai trò. Vui lòng đăng xuất và đăng nhập lại.</p>
      <button onClick={() => setUser(null)}>Đăng xuất</button>
    </div>
  );
}

function TeacherShell({ user, onLogout }) {
  const [tab, setTab] = useState("upload"); // "upload" | "results"

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h1>🎓 Quản lý & Trộn đề</h1>
        <div>
          Xin chào <b>{user?.name}</b> ({user?.code})
          <button style={{ marginLeft: 8 }} onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setTab("upload")}
          style={{ padding: "6px 10px", borderRadius: 6, background: tab === "upload" ? "#e5e7eb" : "#fff", border: "1px solid #ddd" }}
        >
          Tải/Trộn
        </button>
        <button
          onClick={() => setTab("results")}
          style={{ padding: "6px 10px", borderRadius: 6, background: tab === "results" ? "#e5e7eb" : "#fff", border: "1px solid #ddd" }}
        >
          Kết quả
        </button>
      </div>

      {tab === "upload" ? <TeacherUpload /> : <Results />}
    </div>
  );
}

function StudentExam({ user, onLogout }) {
  const [exam, setExam] = useState(null);      // {session_id, questions: [], version?, subject?}
  const [answers, setAnswers] = useState({});  // { [qid]: "A" }
  const [result, setResult] = useState(null);  // {score, total_points}
  const [loading, setLoading] = useState(false);
  const [uiError, setUiError] = useState("");
  const [subject, setSubject] = useState("math"); // chọn môn trước khi bắt đầu

  const beginExam = async () => {
    setLoading(true);
    setUiError("");
    setResult(null);
    try {
      const data = await startExam(user.code, subject); // truyền môn lên BE
      if (!data || !Array.isArray(data.questions)) {
        throw new Error("Phản hồi không hợp lệ từ máy chủ.");
      }
      setExam(data);
      setAnswers({});
    } catch (e) {
      setUiError(e.message || "Không bắt đầu được bài thi.");
    } finally {
      setLoading(false);
    }
  };

  const onChoose = (qid, ch) => {
    setAnswers((prev) => ({ ...prev, [qid]: ch }));
  };

  const doSubmit = async () => {
    if (!exam) return;
    setLoading(true);
    setUiError("");
    try {
      const res = await submitExam(exam.session_id, answers);
      setResult(res);
    } catch (e) {
      setUiError(e.message || "Nộp bài thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const answeredCount =
    exam?.questions?.reduce((acc, q) => acc + (answers[q.id] ? 1 : 0), 0) || 0;

  // Chỉ hiển thị nút Đăng xuất ở header khi CHƯA làm bài hoặc ĐÃ có kết quả
  const showLogoutInHeader = !exam || !!result;

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <h1>👩‍🎓 Bài thi trắc nghiệm</h1>
        {showLogoutInHeader && (
          <button onClick={onLogout} className="btn btn-outline">
            Đăng xuất
          </button>
        )}
      </div>

      <div
        style={{
          marginTop: 12,
          padding: 12,
          background: "#f6f8fa",
          borderRadius: 8,
        }}
      >
        <b>Người dùng:</b> {user?.name} — <b>Mã:</b> {user?.code} — <b>Vai trò:</b>{" "}
        {user?.role}
      </div>

      {uiError && (
        <p style={{ color: "crimson", marginTop: 10 }}>
          ⚠️ {uiError}
        </p>
      )}

      {/* MÀN CHỌN MÔN + BẮT ĐẦU */}
      {!exam && !result && (
        <>
          <div style={{ marginTop: 12 }}>
            <b>Môn:</b>{" "}
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              {SUBJECTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <button onClick={beginExam} disabled={loading} className="btn">
              Bắt đầu làm bài
            </button>
          </div>
        </>
      )}

      {/* ĐANG LÀM BÀI */}
      {exam && !result && (
        <>
          <h3 style={{ marginTop: 16 }}>
            Phiên thi #{exam.session_id}
            {typeof exam.version === "number" && (
              <>
                {" "}- Mã đề: <b>{exam.version}</b>
              </>
            )}
            {exam.subject && (
              <>
                {" "}- Môn:{" "}
                <b>
                  {SUBJECTS.find((s) => s.value === exam.subject)?.label ||
                    exam.subject}
                </b>
              </>
            )}
          </h3>

          <div style={{ marginBottom: 8 }}>
            Đã chọn: {answeredCount}/{exam.questions.length}
          </div>

          <ol>
            {exam.questions.map((q) => (
              <li key={q.id} style={{ marginBottom: 12 }}>
                <div style={{ marginBottom: 6 }}>
                  {q.text} <i>({q.points} đ)</i>
                </div>

                {(q.options || []).map((opt, i) => {
                  const ch = letter(i);
                  return (
                    <label key={i} style={{ display: "block", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={ch}
                        checked={(answers[q.id] || "") === ch}
                        onChange={() => onChoose(q.id, ch)}
                        style={{ marginRight: 6 }}
                      />
                      {ch}. {opt}
                    </label>
                  );
                })}
              </li>
            ))}
          </ol>

          <button onClick={doSubmit} disabled={loading} className="btn">
            Kết thúc
          </button>
        </>
      )}

      {/* SAU KHI NỘP */}
      {result && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: 0 }}>
            Kết quả: {result.score} / {result.total_points}
            {exam?.version != null && (
              <>
                {" "}- Mã đề: <b>{exam.version}</b>
              </>
            )}
            {exam?.subject && (
              <>
                {" "}- Môn:{" "}
                <b>
                  {SUBJECTS.find((s) => s.value === exam.subject)?.label ||
                    exam.subject}
                </b>
              </>
            )}
          </h3>
        </div>
      )}
    </div>
  );
}
