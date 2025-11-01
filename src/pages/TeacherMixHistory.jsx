import { useEffect, useState } from "react";
import { Table, Card, Tag, Spin, message, Button, Modal, Space } from "antd";
import dayjs from "dayjs";
import {
  listMixedExams,
  getMixedExamDetail,
  deleteMixedExam,
} from "../api";

export default function TeacherMixHistory() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [detail, setDetail] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await listMixedExams();
      setData(result || []);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải lịch sử trộn đề");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (record) => {
    try {
      const res = await getMixedExamDetail(record.id);
      setDetail(res);
      setDetailOpen(true);
    } catch (err) {
      console.error(err);
      message.error("Không thể xem chi tiết bộ đề");
    }
  };

  const handleDelete = async (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc muốn xóa bộ đề ${record.subject} - Đề ${record.version}?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      async onOk() {
        try {
          await deleteMixedExam(record.id);
          message.success("Đã xóa bộ đề");
          fetchData();
        } catch (err) {
          console.error(err);
          message.error("Không thể xóa bộ đề");
        }
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: "Môn học",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Mã đề",
      dataIndex: "version",
      key: "version",
      render: (v) => <Tag color="blue">Đề {v}</Tag>,
    },
    {
      title: "Số câu",
      dataIndex: "questions_count",
      key: "questions_count",
      align: "center",
    },
    {
      title: "Thời gian trộn",
      dataIndex: "created_at",
      key: "created_at",
      render: (t) => (t ? dayjs(t).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          <Button
            danger
            size="small"
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="📜 Lịch sử trộn đề" bordered={false}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin tip="Đang tải..." />
        </div>
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 8 }}
        />
      )}

      {/* Modal hiển thị chi tiết */}
      <Modal
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        title={`Chi tiết đề ${detail?.subject || ""} - Đề ${detail?.version || ""}`}
        footer={null}
        width={900}
      >
        {detail && detail.questions?.length > 0 ? (
          <div
            style={{
              maxHeight: "70vh",
              overflowY: "auto",
              paddingRight: 10,
            }}
          >
            {detail.questions.map((q, index) => (
              <div
                key={q.id || index}
                style={{
                  marginBottom: 16,
                  padding: "12px 16px",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 6,
                    fontSize: 15,
                  }}
                >
                  {index + 1}. {q.text}
                </div>

                <ul style={{ marginTop: 4, marginBottom: 8 }}>
                  {q.options.map((opt, idx) => (
                    <li key={idx} style={{ listStyleType: "none", marginLeft: 8 }}>
                      {String.fromCharCode(65 + idx)}. {opt}
                    </li>
                  ))}
                </ul>

                <div style={{ fontSize: 13, color: "#666" }}>
                  <span style={{ marginRight: 12 }}>
                    <strong>Chủ đề:</strong> {q.topic || "Không rõ"}
                  </span>
                  <span style={{ marginRight: 12 }}>
                    <strong>Điểm:</strong> {q.points}
                  </span>
                  <span>
                    <strong>Độ khó:</strong>{" "}
                    <Tag color="geekblue" style={{ marginLeft: 4 }}>
                      {q.difficulty}
                    </Tag>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Không có dữ liệu câu hỏi.</p>
        )}
      </Modal>
    </Card>
  );
}
