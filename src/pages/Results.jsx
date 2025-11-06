import { useEffect, useMemo, useState } from "react";
import {Table, Button, Select, Input, Card, Typography, Space, Tag, message, Modal, Spin} from "antd";
import { EyeOutlined, ReloadOutlined, CloseOutlined } from "@ant-design/icons";
import { listResults, getResultDetail } from "../api.js";

const { Title, Text } = Typography;

const SUBJECTS = [
  { value: "", label: "— Tất cả —" },
  { value: "math", label: "Toán" },
  { value: "literature", label: "Văn" },
  { value: "english", label: "Anh" },
];

const letter = (i) => String.fromCharCode(65 + i);
const fmtTime = (s) => (s ? s.replace("T", " ").slice(0, 19) : "—");

export default function TeacherResults() {
  const [subject, setSubject] = useState("");
  const [student, setStudent] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // Modal state

  const reload = async () => {
    setLoading(true);
    try {
      const raw = await listResults({
        subject: subject || "",
        student_code: student.trim() || "",
      });
      const rows = Array.isArray(raw) ? raw : raw?.items ?? raw?.data ?? [];
      setItems(rows);
    } catch (e) {
      message.error(e.message || "Không tải được danh sách kết quả");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const onView = async (sid) => {
    setLoadingDetail(true);
    try {
      const data = await getResultDetail(sid);
      const byQid = Object.create(null);
      (data.details || []).forEach((d) => (byQid[d.qid] = d));

      const merged = (data.questions || []).map((q) => {
        const d = byQid[q.qid] || {};
        return {
          qid: q.qid,
          text: q.text,
          options: q.options || [],
          points: q.points ?? d.points ?? 1,
          chosen: d.chosen || "",
          correct_answer: d.correct || "",
          earned_points: d.earned_points ?? 0,
        };
      });

      setSelected({ ...data, merged });
      setModalOpen(true); // Mở popup
    } catch (e) {
      message.error(e.message || "Không tải được chi tiết bài làm");
    } finally {
      setLoadingDetail(false);
    }
  };

  const subjectLabel = useMemo(() => {
    if (!selected?.subject) return "";
    return SUBJECTS.find((s) => s.value === selected.subject)?.label || selected.subject;
  }, [selected]);

  const columns = [
    { title: "Phiên", dataIndex: "session_id", render: (v) => `#${v}` },
    { title: "Mã HS", dataIndex: "student_code" },
    {
      title: "Môn",
      dataIndex: "subject",
      render: (v) =>
        v ? SUBJECTS.find((s) => s.value === v)?.label || v : <Text type="secondary">—</Text>,
    },
    { title: "Mã đề", dataIndex: "version", render: (v) => v ?? "—" },
    {
      title: "Điểm",
      render: (r) => (
        <b>
          {r.score}/{r.total_points}
        </b>
      ),
    },
    { title: "Nộp lúc", dataIndex: "submitted_at", render: fmtTime },
    {
      title: "Hành động",
      render: (r) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => onView(r.session_id)}
          loading={loadingDetail && selected?.session_id === r.session_id}
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Title level={3}>Kết quả các phiên thi</Title>

      {/* Bộ lọc */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            value={subject}
            style={{ width: 160 }}
            onChange={setSubject}
            options={SUBJECTS}
          />
          <Input
            placeholder="Mã học sinh (vd: S1)"
            value={student}
            onChange={(e) => setStudent(e.target.value)}
            style={{ width: 180 }}
          />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={reload}
            loading={loading}
          >
            Lọc / Tải lại
          </Button>
        </Space>
      </Card>

      {/* Bảng tóm tắt */}
      <Card>
        <Table
          columns={columns}
          dataSource={items}
          rowKey={(r) => `${r.session_id}-${r.student_code}`}
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* MODAL CHI TIẾT - ĐẸP & MƯỢT */}
      <Modal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        footer={null}
        width={900}
        title={
          <Space>
            <Text strong>
              Chi tiết phiên #{selected?.session_id} — HS: {selected?.student_code}
            </Text>
            <Tag color="blue">{subjectLabel}</Tag>
            <Tag color="orange">Mã đề {selected?.version ?? "—"}</Tag>
          </Space>
        }
        closeIcon={<CloseOutlined />}
      >
        {loadingDetail ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin tip="Đang tải chi tiết..." />
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16, fontSize: 15 }}>
              <b>Điểm:</b> {selected?.score}/{selected?.total_points} điểm ·{" "}
              <b>Nộp lúc:</b> {fmtTime(selected?.submitted_at)}
            </div>

            <div style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: 8 }}>
              <ol style={{ paddingLeft: 20 }}>
                {(selected?.merged || []).map((q, idx) => (
                  <li key={q.qid || idx} style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>
                      Câu {idx + 1}. {q.text} <i style={{ color: "#888" }}>({q.points} điểm)</i>
                    </div>
                    <ul style={{ margin: "8px 0 0 20px", padding: 0 }}>
                      {q.options.map((opt, i) => {
                        const ch = letter(i);
                        const isCorrect = ch === (q.correct_answer || "").trim();
                        const isChosen = ch === (q.chosen || "").trim();
                        return (
                          <li
                            key={i}
                            style={{
                              listStyle: "disc",
                              color: isCorrect
                                ? "#389e0d"
                                : isChosen && !isCorrect
                                ? "#cf1322"
                                : "#000",
                              fontWeight: isCorrect || isChosen ? 600 : 400,
                            }}
                          >
                            {ch}. {opt}
                            {isCorrect && " (Đáp án đúng)"}
                            {isChosen && !isCorrect && " (Bạn chọn)"}
                            {isChosen && isCorrect && " (Đúng!)"}
                          </li>
                        );
                      })}
                    </ul>
                    {q.earned_points < q.points && (
                      <div style={{ marginTop: 4, color: "#cf1322", fontSize: 13 }}>
                        Mất {q.points - q.earned_points} điểm
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}