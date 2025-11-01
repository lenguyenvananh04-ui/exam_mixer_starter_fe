import { useEffect, useState } from "react";
import { Table, Card, Tag, Spin, message, Button, Modal } from "antd";
import dayjs from "dayjs";
import {
  listMixedExams,
  getMixedExamDetail,
  deleteMixedExam,
} from "../api"; // ✅ import thêm 2 hàm mới

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
    if (!window.confirm(`Xóa bộ đề ${record.subject} - Đề ${record.version}?`))
      return;
    try {
      await deleteMixedExam(record.id);
      message.success("Đã xóa bộ đề");
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Không thể xóa bộ đề");
    }
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
      render: (_, record) => (
        <>
          <Button
            type="link"
            onClick={() => handleView(record)}
            style={{ marginRight: 8 }}
          >
            👁 Xem
          </Button>
          <Button danger type="link" onClick={() => handleDelete(record)}>
            🗑 Xóa
          </Button>
        </>
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
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* Modal hiển thị chi tiết */}
      <Modal
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        title={`Chi tiết đề ${detail?.subject || ""} - Đề ${detail?.version || ""}`}
        footer={null}
        width={800}
      >
        {detail ? (
          <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 6 }}>
            {JSON.stringify(detail.questions, null, 2)}
          </pre>
        ) : (
          <p>Không có dữ liệu.</p>
        )}
      </Modal>
    </Card>
  );
}
