// src/pages/TeacherUpload.jsx
import { useState } from "react";
import { uploadBank, previewExams, publishExam } from "../api.js";

const letter = (i) => String.fromCharCode(65 + i);

const SUBJECTS = [
  { value: "math", label: "Toán" },
  { value: "literature", label: "Văn" },
  { value: "english", label: "Anh" },
];

export default function TeacherUpload() {
  const [file, setFile] = useState(null);
  const [bankInfo, setBankInfo] = useState(null);          // {saved_to,count} | {saved,count}
  const [nQuestions, setNQuestions] = useState(10);
  const [nVersions, setNVersions] = useState(4);
  const [seed, setSeed] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null);            // payload từ /exam/preview
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [subject, setSubject] = useState("math");

  // --- Tỷ lệ độ khó (đơn vị %). Sẽ tự chuẩn hoá về 100 khi Preview/Publish ---
  const [easyPct, setEasyPct] = useState(40);
  const [midPct,  setMidPct]  = useState(40);
  const [hardPct, setHardPct] = useState(20);

  // helper: chuẩn hoá trường trả về khác nhau từ BE
  const getSavedPath = (info) => info?.saved_to || info?.saved || info?.bank_path || null;
  const getTotalQ = (info) => (info?.total_questions ?? info?.count ?? info?.total ?? null);

  // Chuẩn hoá % → (easy, medium, hard) ∈ [0,1], tổng = 1
  const buildDifficultyMix = () => {
    const e = Number(easyPct) || 0;
    const m = Number(midPct)  || 0;
    const h = Number(hardPct) || 0;
    const sum = e + m + h;
    if (sum <= 0) {
      // fallback an toàn
      return { easy: 0.34, medium: 0.33, hard: 0.33, _normalizedFrom: 0 };
    }
    return {
      easy:   e / sum,
      medium: m / sum,
      hard:   h / sum,
      _normalizedFrom: sum,
    };
  };

  // 1) Upload CSV (giữ nguyên luồng cũ). Nếu BE của bạn đã hỗ trợ subject qua FormData,
  // bạn có thể sửa uploadBank(file) -> uploadBank(file, subject). Ở đây mình giữ nguyên
  // để không ảnh hưởng code đang chạy ổn của bạn.
  const doUpload = async () => {
    if (!file) return;
    setBusy(true); setErr(""); setOkMsg(""); setPreview(null);
    try {
      const data = await uploadBank(file); // nếu BE cần subject, đổi thành uploadBank(file, subject)
      setBankInfo(data);
      const total = getTotalQ(data);
      const path = getSavedPath(data);
      setOkMsg(`✅ Đã tải ${total ?? "?"} câu. Lưu tại: ${path ?? "(không rõ đường dẫn)"}`);
    } catch (e) {
      setErr(e.message || "Upload thất bại");
    } finally {
      setBusy(false);
    }
  };

  // 2) Preview đề — gửi thêm subject + difficulty_mix (vẫn giữ nguyên các tham số cũ)
  const doPreview = async () => {
    setBusy(true); setErr(""); setOkMsg(""); setPreview(null);
    try {
      const path = getSavedPath(bankInfo);
      const mix = buildDifficultyMix();

      // Nếu API wrapper previewExams của bạn CHƯA hỗ trợ subject/difficulty_mix,
      // ta gọi fetch trực tiếp để không đụng chạm api.js.
      const res = await fetch("http://localhost:8000/exam/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          n_questions: Number(nQuestions),
          n_versions: Number(nVersions),
          seed: seed === "" ? null : Number(seed),
          bank_path: path,
          shuffle_questions: true,
          shuffle_options: true,
          subject,
          // BE có thể đọc 1 trong 2 dạng dưới đây, bạn giữ 1 dạng là đủ:
          difficulty_mix: { easy: mix.easy, medium: mix.medium, hard: mix.hard },
          // e_ratio/m_ratio/h_ratio là fallback nếu bạn implement theo 3 số rời:
          e_ratio: mix.easy, m_ratio: mix.medium, h_ratio: mix.hard,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Preview thất bại");
      setPreview(data);

      // Cảnh báo nhỏ nếu tổng % không đúng 100 (mình đã chuẩn hoá rồi)
      if (mix._normalizedFrom && Math.round(mix._normalizedFrom) !== 100) {
        setOkMsg(`✅ Đã tạo bản xem trước. (Tỷ lệ nhập tổng ${mix._normalizedFrom}%, đã tự chuẩn hoá về 100%)`);
      } else {
        setOkMsg("✅ Đã tạo bản xem trước.");
      }
    } catch (e) {
      setErr(e.message || "Preview thất bại");
    } finally {
      setBusy(false);
    }
  };

  // 3) Xuất bản cấu hình — gửi thêm subject + difficulty_mix
  const doPublish = async () => {
    setBusy(true); setErr(""); setOkMsg("");
    try {
      const path = getSavedPath(bankInfo);
      const mix = buildDifficultyMix();

      // Nếu api.js/publishExam chưa nhận được subject/difficulty, ta gọi fetch trực tiếp
      const res = await fetch("http://localhost:8000/exam/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          n_questions: Number(nQuestions),
          n_versions: Number(nVersions),
          seed: seed === "" ? null : Number(seed),
          bank_path: path,
          shuffle_questions: true,
          shuffle_options: true,
          subject,
          difficulty_mix: { easy: mix.easy, medium: mix.medium, hard: mix.hard },
          e_ratio: mix.easy, m_ratio: mix.medium, h_ratio: mix.hard,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xuất bản lỗi");

      if (mix._normalizedFrom && Math.round(mix._normalizedFrom) !== 100) {
        setOkMsg("🚀 Đã xuất bản các mã đề! (sắp xếp ngẫu nhiên).");
      } else {
        setOkMsg("🚀 Đã xuất bản các mã đề!");
      }
    } catch (e) {
      setErr(e.message || "Xuất bản lỗi");
    } finally {
      setBusy(false);
    }
  };

  const totalUploaded = getTotalQ(bankInfo);
  const savedPath = getSavedPath(bankInfo);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <h2>📤 Tải ngân hàng câu hỏi & Trộn đề (GV)</h2>

      {/* Môn học */}
      <div style={{ marginBottom: 12 }}>
        <b>Môn:</b>{" "}
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          {SUBJECTS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* BƯỚC 1: Upload CSV */}
      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <b>Bước 1:</b> Chọn file CSV (7 cột: <code>id, question, options, answer, points, topic, difficulty</code>)
        <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button onClick={doUpload} disabled={!file || busy}>
            {busy ? "Đang tải..." : "Tải lên"}
          </button>
        </div>
        {bankInfo && (
          <p style={{ marginTop: 8, color: "#0a7" }}>
            Đã tải: <b>{totalUploaded ?? "?"}</b> câu — Đường dẫn: <code>{savedPath ?? "(không rõ)"}</code>
          </p>
        )}
      </div>

      {/* BƯỚC 2: Cấu hình + Tỷ lệ độ khó */}
      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
        <b>Bước 2:</b> Chọn cấu hình trộn (xem trước)
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
          <label>
            Số câu mỗi đề:{" "}
            <input
              type="number" min="1" value={nQuestions}
              onChange={(e) => setNQuestions(e.target.value)}
              style={{ width: 90 }}
            />
          </label>
          <label>
            Số mã đề:{" "}
            <input
              type="number" min="1" value={nVersions}
              onChange={(e) => setNVersions(e.target.value)}
              style={{ width: 90 }}
            />
          </label>
          <label>
            Seed (tùy chọn):{" "}
            <input
              type="number" placeholder="(để trống nếu không dùng)"
              value={seed} onChange={(e) => setSeed(e.target.value)}
              style={{ width: 160 }}
            />
          </label>
        </div>

        {/* Tỷ lệ độ khó */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(160px, 1fr))",
          gap: 12,
          marginTop: 12,
          background: "#fafbfc",
          border: "1px dashed #ddd",
          borderRadius: 8,
          padding: 12
        }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Tỷ lệ độ khó (%)</div>
            <label style={{ display: "block", marginBottom: 6 }}>
              Dễ:
              <input
                type="number" min="0" max="100" value={easyPct}
                onChange={(e) => setEasyPct(e.target.value)}
                style={{ width: 90, marginLeft: 8 }}
              />
            </label>
            <label style={{ display: "block", marginBottom: 6 }}>
              Trung bình:
              <input
                type="number" min="0" max="100" value={midPct}
                onChange={(e) => setMidPct(e.target.value)}
                style={{ width: 90, marginLeft: 8 }}
              />
            </label>
            <label style={{ display: "block" }}>
              Khó:
              <input
                type="number" min="0" max="100" value={hardPct}
                onChange={(e) => setHardPct(e.target.value)}
                style={{ width: 90, marginLeft: 8 }}
              />
            </label>
          </div>
          <div style={{ alignSelf: "end" }}>
            <button onClick={doPreview} disabled={busy} style={{ width: "100%" }}>
              {busy ? "Đang trộn..." : "Trộn & Xem trước"}
            </button>
          </div>
        </div>
      </div>

      {/* Thông báo */}
      {okMsg && <p style={{ color: "#0a7", marginTop: 8 }}>{okMsg}</p>}
      {err && <p style={{ color: "crimson", marginTop: 8 }}>{err}</p>}

      {/* KHU VỰC PREVIEW + NÚT XUẤT BẢN */}
      {preview && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <p style={{ margin: 0 }}>
              Môn: <b>{SUBJECTS.find(s => s.value === preview.subject)?.label || preview.subject}</b> —{" "}
              Ngân hàng: <code>{preview.bank_path}</code> — Tổng câu: <b>{preview.bank_size}</b> — Mỗi đề:{" "}
              <b>{preview.n_questions}</b> — Số mã: <b>{preview.n_versions}</b>
            </p>

            <button
              onClick={doPublish}
              disabled={busy}
              style={{ padding: "8px 12px", borderRadius: 6, cursor: "pointer" }}
              title="Xuất bản"
            >
              Xuất bản
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {preview.versions.map((v) => (
              <div key={v.version} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 8, background: "#fff" }}>
                <h4 style={{ marginTop: 0 }}>Đề {v.version}</h4>
                <ol>
                  {v.questions.map((q) => (
                    <li key={q.id} style={{ marginBottom: 8 }}>
                      <div style={{ fontWeight: 600 }}>{q.text}</div>
                      {(q.options || []).length > 0 && (
                        <ul style={{ marginTop: 4 }}>
                          {q.options.map((opt, i) => (
                            <li key={i}>
                              {letter(i)}. {opt}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
