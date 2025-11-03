import { useState } from "react";
import { login, registerUser } from "../api.js";
import { Form, Input, Button, Card, Typography, message, Spin, Alert } from "antd";
import { UserOutlined, LockOutlined, TeamOutlined, ClockCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (isRegister) {
        await registerUser({
          code: values.code,
          name: values.name,
          password: values.password,
        });
        message.success("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsRegister(false);
        form.resetFields();
      } else {
        const user = await login(values.code.trim(), values.password);

        if (user.status === "pending") {
          message.warning({
            content: (
              <span>
                <ClockCircleOutlined style={{ color: "#faad14" }} />{" "}
                <strong>Chờ duyệt</strong>
                <br />
                <small>Tài khoản đang chờ quản trị viên phê duyệt.</small>
              </span>
            ),
            duration: 6,
            icon: <ClockCircleOutlined style={{ color: "#faad14" }} />,
          });
          return;
        }

        if (user.status === "rejected") {
          message.error({
            content: (
              <span>
                <CloseCircleOutlined style={{ color: "#ff4d4f" }} />{" "}
                <strong>Bị từ chối</strong>
                <br />
                <small>Liên hệ quản trị viên để biết lý do.</small>
              </span>
            ),
            duration: 8,
            icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
          });
          return;
        }

        // Đăng nhập thành công
        message.success("Đăng nhập thành công!");
        onLogin?.(user);
      }
    } catch (err) {
      message.error(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img
            src="https://i.pinimg.com/736x/5d/70/30/5d70306c8ceb0a80844ff10c839c51b2.jpg"
            alt="Logo"
            style={{ width: 60, height: 60, borderRadius: 12, objectFit: "cover" }}
          />
          <Title level={2} style={{ margin: "16px 0 8px", color: "#1a1a1a" }}>
            Exam System
          </Title>
          <p style={{ color: "#666", fontSize: 16 }}>
            {isRegister ? "Tạo tài khoản mới" : "Chào mừng quay lại!"}
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          {isRegister && (
            <Form.Item
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input
                prefix={<TeamOutlined />}
                placeholder="Họ và tên"
                size="large"
              />
            </Form.Item>
          )}

          <Form.Item
            name="code"
            rules={[
              { required: true, message: "Vui lòng nhập mã sinh viên!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Mã sinh viên (S1, T1...)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{ height: 48, fontWeight: "bold" }}
            >
              {loading ? "Đang xử lý..." : isRegister ? "Đăng ký" : "Đăng nhập"}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          <span style={{ color: "#888" }}>
            {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
          </span>
          <a
            href="#!"
            onClick={(e) => {
              e.preventDefault();
              setIsRegister(!isRegister);
              form.resetFields();
            }}
            style={{ fontWeight: 600 }}
          >
            {isRegister ? "Đăng nhập ngay" : "Đăng ký miễn phí"}
          </a>
        </div>

        {/* Hiển thị thông tin trạng thái (nếu cần) */}
        <div style={{ marginTop: 16, fontSize: 13, color: "#999", textAlign: "center" }}>
          <ClockCircleOutlined /> Chờ duyệt | <CloseCircleOutlined /> Bị từ chối
        </div>
      </Card>
    </div>
  );
}