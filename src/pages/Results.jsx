
import { useEffect, useMemo, useState } from "react";
import { listResults, getResultDetail } from "../api.js";

const SUBJECTS = [
  { value: "", label: "— Tất cả —" },
  { value: "math", label: "Toán" },
  { value: "literature", label: "Văn" },
  { value: "english", label: "Anh" },
];

const letter = (i) => String.fromCharCode(65 + i);

export default function TeacherResults() {
  const [subject, setSubject] = useState("");
  const [student, setStudent] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [selected, setSelected] = useState(null); // {session_id,...} từ /results/session/:id
  const [loadingDetail, setLoadingDetail] = useState(false);

  const reload = async () => {
    setLoading(true); setErr(""); setSelected(null);
    try {
      const data = await listResults({
        subject: subject || "",
        student_code: student.trim() || "",
      });
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setErr(e.message || "Không tải được danh sách kết quả");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); /* tải ban đầu */ }, []);

  const onView = async (sid) => {
    setLoadingDetail(true); setErr("");
    try {
      const detail = await getResultDetail(sid);
      setSelected(detail);
    } catch (e) {
      setErr(e.message || "Không tải được chi tiết bài làm");
    } finally {
      setLoadingDetail(false);
    }
  };

  const subjectLabel = useMemo(() => {
    if (!selected?.subject) return "";
    return SUBJECTS.find(s => s.value === selected.subject)?.label || selected.subject;
  }, [selected]);

  return (
    <div style={{ padding: 12 }}>
      <h2>📊 Kết quả các phiên thi</h2>

      {/* Bộ lọc */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
        <label>
          Môn:{" "}
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        <input
          placeholder="Mã học sinh (vd: S1)"
          value={student}
          onChange={(e) => setStudent(e.target.value)}
          style={{ width: 180 }}
        />
        <button onClick={reload} disabled={loading}>
          {loading ? "Đang tải..." : "Lọc / Tải lại"}
        </button>
      </div>

      {err && <p style={{ color: "crimson" }}>⚠️ {err}</p>}

      {/* Bảng kết quả tóm tắt */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f2f4f7" }}>
              <th style={th}>Phiên</th>
              <th style={th}>Mã HS</th>
              <th style={th}>Môn</th>
              <th style={th}>Mã đề</th>
              <th style={th}>Điểm</th>
              <th style={th}>Nộp lúc</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 10, textAlign: "center", color: "#666" }}>
                Không có dữ liệu
              </td></tr>
            )}
            {items.map(r => (
              <tr key={r.session_id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={td}>#{r.session_id}</td>
                <td style={td}>{r.student_code}</td>
                <td style={td}>{r.subject || "—"}</td>
                <td style={td}>{r.version ?? "—"}</td>
                <td style={td}><b>{r.score}/{r.total_points}</b></td>
                <td style={td} title={r.submitted_at}>{r.submitted_at?.replace("T"," ").slice(0,19)}</td>
                <td style={td}>
                  <button onClick={() => onView(r.session_id)} disabled={loadingDetail}>
                    {loadingDetail && selected?.session_id === r.session_id ? "Đang mở..." : "Xem"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Panel chi tiết */}
      {selected && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0 }}>
              Chi tiết phiên #{selected.session_id} — HS: {selected.student_code}
            </h3>
            <div>
              <button onClick={() => setSelected(null)}>Đóng</button>
            </div>
          </div>
          <p style={{ margin: "6px 0 12px" }}>
            Môn: <b>{subjectLabel || "—"}</b>
            {" · "}Mã đề: <b>{selected.version ?? "—"}</b>
            {" · "}Điểm: <b>{selected.score}/{selected.total_points}</b>
          </p>

          <ol>
            {(selected.details || []).map((q, idx) => (
              <li key={q.id} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {q.text} <i>({q.points} đ)</i>
                </div>
                <ul style={{ margin: 0 }}>
                  {(q.options || []).map((opt, i) => {
                    const ch = letter(i);
                    const isCorrect = ch === (q.correct_answer || "").slice(0,1);
                    const isChosen  = ch === (q.chosen || "").slice(0,1);
                    return (
                      <li key={i} style={{
                        listStyle: "disc",
                        marginLeft: 18,
                        color: isCorrect ? "#047857" : (isChosen && !isCorrect ? "#b91c1c" : "inherit"),
                        fontWeight: isCorrect ? 700 : 400,
                      }}>
                        {ch}. {opt}
                        {isCorrect && " ✓"}
                        {isChosen && !isCorrect && " (bạn chọn)"}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

const th = { padding: 8, textAlign: "left", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" };
const td = { padding: 8, verticalAlign: "top", whiteSpace: "nowrap" };
