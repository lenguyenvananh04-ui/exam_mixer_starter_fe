import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  message,
  Space,
  Card,
  Typography,
  Input,
  Select,
  Popconfirm,
  Avatar,
  Modal,
  Form,
  Input as AntInput,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  UserAddOutlined,
  MailOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  listUsers,
  approveUser,
  rejectUser,
  deleteUser,
  createUserByAdmin,
} from "../api.js";

const { Title } = Typography;
const { Option } = Select;

export default function AdminUserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (e) {
      message.error("Không tải được danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    await approveUser(id);
    message.success("Đã duyệt tài khoản");
    fetchData();
  };

  const handleReject = async (id) => {
    await rejectUser(id);
    message.warning("Đã từ chối tài khoản");
    fetchData();
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    message.success("Đã xóa tài khoản");
    fetchData();
  };

  const handleCreate = async (values) => {
    try {
      await createUserByAdmin({
        ...values,
        role: values.role || "student",
      });
      message.success("Tạo tài khoản thành công!");
      form.resetFields();
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      message.error(err.message || "Tạo tài khoản thất bại");
    }
  };

  // Lọc dữ liệu
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.code.toLowerCase().includes(searchText.toLowerCase()) ||
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchText.toLowerCase()));

    const matchesStatus = filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusTag = (status) => {
    switch (status) {
      case "approved":
        return <Tag icon={<CheckCircleOutlined />} color="success">ĐÃ DUYỆT</Tag>;
      case "pending":
        return <Tag icon={<CheckCircleOutlined />} color="processing">CHỜ DUYỆT</Tag>;
      case "rejected":
        return <Tag icon={<CloseCircleOutlined />} color="error">BỊ TỪ CHỐI</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Người dùng",
      render: (_, record) => (
        <Space>
          <Avatar style={{ backgroundColor: "#1890ff" }} icon={<UserOutlined />}>
            {record.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{record.code}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (email) => email || <span style={{ color: "#ccc" }}>Chưa có</span>,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      render: (role) => (
        <Tag color={role === "admin" ? "purple" : role === "teacher" ? "orange" : "blue"}>
          {role === "admin" ? "QUẢN TRỊ" : role === "teacher" ? "GIÁO VIÊN" : "HỌC SINH"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: getStatusTag,
      align: "center",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          {record.status === "pending" && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record.id)}
              >
                Duyệt
              </Button>
              <Popconfirm
                title="Từ chối tài khoản này?"
                onConfirm={() => handleReject(record.id)}
                okText="Từ chối"
                cancelText="Hủy"
              >
                <Button danger size="small" icon={<CloseCircleOutlined />}>
                  Từ chối
                </Button>
              </Popconfirm>
            </>
          )}
          <Popconfirm
            title="Xóa tài khoản này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger type="text" size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Card>
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý tài khoản
            </Title>
            <p style={{ color: "#666", margin: "4px 0 0" }}>
              Tạo, duyệt, từ chối hoặc xóa tài khoản người dùng
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<UserAddOutlined />}
            onClick={() => setIsModalOpen(true)}
            style={{ height: 48, fontWeight: "bold" }}
          >
            Tạo tài khoản
          </Button>
        </div>

        {/* Thanh tìm kiếm & lọc */}
        <Space style={{ marginBottom: 16, width: "100%" }} wrap>
          <Input
            placeholder="Tìm theo mã, tên, email..."
            prefix={<SearchOutlined />}
            allowClear
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            value={filterStatus}
            size="large"
            style={{ width: 180 }}
            onChange={setFilterStatus}
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="pending">Chờ duyệt</Option>
            <Option value="approved">Đã duyệt</Option>
            <Option value="rejected">Bị từ chối</Option>
          </Select>
        </Space>

        {/* Bảng */}
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} tài khoản`,
          }}
          bordered
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Modal tạo tài khoản */}
      <Modal
        title={<span><UserAddOutlined /> Tạo tài khoản mới</span>}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ role: "student" }}
        >
          <Form.Item
            name="code"
            label="Mã người dùng"
            rules={[
              { required: true, message: "Vui lòng nhập mã!" },
              { pattern: /^[A-Z0-9]+$/, message: "Chỉ chữ hoa và số!" },
            ]}
          >
            <AntInput prefix={<UserOutlined />} placeholder="S001, T001..." />
          </Form.Item>

          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <AntInput placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" }
            ]}
          >
            <AntInput.Password prefix={<LockOutlined />} placeholder="••••••••" />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <AntInput prefix={<MailOutlined />} placeholder="email@school.edu.vn" />
          </Form.Item>

          <Form.Item name="role" label="Vai trò">
            <Select>
              <Option value="student">Học sinh</Option>
              <Option value="teacher">Giáo viên</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo ngay
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}