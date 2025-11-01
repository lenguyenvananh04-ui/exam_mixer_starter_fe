import React, { useEffect, useState } from "react";
import {
    Table,
    Button,
    Upload,
    message,
    Popconfirm,
    Modal,
    Form,
    Input,
    Space,
} from "antd";
import {
    UploadOutlined,
    DeleteOutlined,
    EditOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import {
    listUploadedExams,
    createUploadedExam,
    updateUploadedExam,
    deleteUploadedExam,
} from "../api.js";

const UploadList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await listUploadedExams();
            setData(res || []);
        } catch (err) {
            message.error("Không tải được danh sách bài thi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ===== Upload file mới =====
    const handleUpload = async ({ file }) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("subject", "math"); // có thể lấy từ select nếu muốn

        try {
            await createUploadedExam(fd);
            message.success("Tải lên thành công!");
            loadData();
        } catch (err) {
            message.error(err.message || "Lỗi khi upload");
        }
    };

    // ===== Xóa =====
    const handleDelete = async (id) => {
        try {
            await deleteUploadedExam(id);
            message.success("Đã xóa!");
            loadData();
        } catch {
            message.error("Lỗi khi xóa");
        }
    };

    // ===== Cập nhật thông tin =====
    const handleEdit = (record) => {
        setEditing(record);
        form.setFieldsValue(record);
    };

    const handleUpdate = async () => {
        try {
            const values = await form.validateFields();
            await updateUploadedExam(editing.id, values);
            message.success("Cập nhật thành công!");
            setEditing(null);
            loadData();
        } catch (err) {
            message.error("Cập nhật thất bại");
        }
    };

    const columns = [
        {
            title: "Môn học",
            dataIndex: "subject",
            key: "subject",
            width: 120,
        },
        {
            title: "Tên file",
            dataIndex: "filename",
            key: "filename",
        },
        {
            title: "Thời gian tải lên",
            dataIndex: "uploaded_at",
            key: "uploaded_at",
            width: 180,
            render: (t) =>
                t ? new Date(t * 1000).toLocaleString("vi-VN") : "--",
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Xóa bài thi này?"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <h2>📘 Danh sách bài thi đã tải lên</h2>

            <div style={{ marginBottom: 16 }}>
                <Space>
                    <Upload
                        showUploadList={false}
                        customRequest={handleUpload}
                        accept=".csv,.xlsx"
                    >
                        <Button icon={<UploadOutlined />}>Tải lên bài thi</Button>
                    </Upload>

                    <Button
                        icon={<ReloadOutlined />}
                        onClick={loadData}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="id"
                bordered
            />

            <Modal
                open={!!editing}
                title="Cập nhật thông tin bài thi"
                onCancel={() => setEditing(null)}
                onOk={handleUpdate}
                okText="Lưu"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="subject" label="Môn học">
                        <Input />
                    </Form.Item>
                    <Form.Item name="filename" label="Tên file">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UploadList;
