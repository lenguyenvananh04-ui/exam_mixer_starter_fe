// src/App.jsx
import {useState} from "react";
import Login from "./pages/Login.jsx";
import TeacherUpload from "./pages/TeacherUpload.jsx";
import UploadList from "./pages/UploadedExamList.jsx"
import TeacherMixHistory from "./pages/TeacherMixHistory.jsx"
import AdminUserManager from "./pages/AdminUserManager.jsx"
import Results from "./pages/Results.jsx";
import {startExam, submitExam} from "./api.js";
import Header from "./compoment/Header.jsx";
import '../src/css/app.css'
import Footer from "./compoment/Footer.jsx";
import Navbar from "./compoment/Navbar.jsx";
import { Card, Radio, Typography, Space, Button, Progress, Tag, Tabs} from "antd";
import {
    BookOutlined,
    PlayCircleOutlined,
    CheckCircleOutlined,
    SendOutlined,
} from "@ant-design/icons";
const { Title, Text } = Typography;
import { ArrowLeftOutlined } from "@ant-design/icons";

const letter = (i) => String.fromCharCode(65 + i);

const SUBJECTS = [
    {value: "math", label: "Toán"},
    {value: "literature", label: "Văn"},
    {value: "english", label: "Anh"},
];

export default function App() {
    const [user, setUser] = useState(null); // {code,name,role}

    // Chưa đăng nhập
    if (!user) return <Login onLogin={setUser}/>;

    // Giáo viên
    if (user?.role === "teacher") {
        return <TeacherShell user={user} onLogout={() => setUser(null)}/>;
    }

    // Học sinh
    if (user?.role === "student") {
        return <StudentExam user={user} onLogout={() => setUser(null)}/>;
    }

    if (user?.role === "admin") {
        return <AdminShell user={user} onLogout={() => setUser(null)} />;
    }
    // Fallback
    return (
        <div style={{padding: 16}}>
            <div style={{marginBottom: 12}}>
                Xin chào <b>{user?.name || "?"}</b> ({user?.code || "?"})
            </div>
            <p>Không xác định vai trò. Vui lòng đăng xuất và đăng nhập lại.</p>
            <button onClick={() => setUser(null)}>Đăng xuất</button>
        </div>
    );
}
function AdminShell({ user, onLogout }) {
  const [tab, setTab] = useState("users");

  const items = [
    {
      key: "users",
      label: "👤 Quản lý tài khoản",
      children: <AdminUserManager />,
    },
  ];

  return (
    <div id="root" className="d-flex flex-column min-vh-100">
      <Header onLogout={onLogout} user={user} />
      <div className="container pt-1">
        <Tabs
          items={items}
          activeKey={tab}
          onChange={(key) => setTab(key)}
          type="card"
          tabBarStyle={{ marginBottom: 12 }}
        />
      </div>
      <Footer />
    </div>
  );
}

function TeacherShell({user, onLogout}) {
    const [tab, setTab] = useState("upload"); // "upload" | "results"

    const items = [
        {
            key: "upload",
            label: "📤 Tải / Trộn đề",
            children: <TeacherUpload />,
        },
       {
           key: "uploads",
           label: "📂 Danh mục bài thi",
           children: <UploadList/>,
       },
        {
            key: "mix-history",
            label: "📜 Lịch sử trộn đề",
            children: <TeacherMixHistory />,
        },
        {
            key: "results",
            label: "📊 Kết quả",
            children: <Results />,
        },
    ];

    return (
        <div id="root" className='d-flex flex-column min-vh-100'>
            <Header onLogout={onLogout} user={user}/>

            <div className='container pt-1'>
                <Tabs
                    items={items}
                    activeKey={tab}
                    onChange={(key) => setTab(key)}
                    type="card"
                    tabBarStyle={{ marginBottom: 12 }}
                />

            </div>
            <Footer/>
        </div>
    );
}

function StudentExam({user, onLogout}) {
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
        setAnswers((prev) => ({...prev, [qid]: ch}));
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
        <div id="root" className='d-flex flex-column min-vh-100'>
            <Header onLogout={onLogout} user={user}/>
            <Navbar/>
            <div className='container'>
                <div>
                    {uiError && (
                        <p style={{color: "crimson", marginTop: 10}}>
                            ⚠️ {uiError}
                        </p>
                    )}

                    {/* MÀN CHỌN MÔN + BẮT ĐẦU */}
                    {!exam && !result && (
                        <>
                            <div style={{ textAlign: "center", marginTop: 32 }}>
                                <Title level={2}>🎯 Chọn môn thi</Title>
                                <Space wrap size="middle" style={{ marginTop: 16 }}>
                                    {SUBJECTS.map((s) => (
                                        <Button
                                            key={s.value}
                                            type={subject === s.value ? "primary" : "default"}
                                            shape="round"
                                            size="large"
                                            icon={<BookOutlined />}
                                            onClick={() => setSubject(s.value)}
                                            style={{
                                                minWidth: 120,
                                                fontWeight: subject === s.value ? 600 : 400,
                                            }}
                                        >
                                            {s.label}
                                        </Button>
                                    ))}
                                </Space>

                                <div style={{ marginTop: 24 }}>
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<PlayCircleOutlined />}
                                        onClick={beginExam}
                                        loading={loading}
                                        shape="round"
                                    >
                                        Bắt đầu làm bài
                                    </Button>
                                </div>
                            </div>
                        </>

                    )}

                    {/* ĐANG LÀM BÀI */}
                    {exam && !result && (
                        <>
                            <Card
                                title={
                                    <>
                                        <Title level={4} style={{ margin: 0 }}>
                                            Phiên thi #{exam.session_id}
                                        </Title>
                                        <div style={{ fontSize: 14, marginTop: 4 }}>
                                            {typeof exam.version === "number" && (
                                                <>
                                                    Mã đề: <b>{exam.version}</b>{" "}
                                                </>
                                            )}
                                            {exam.subject && (
                                                <>
                                                    - Môn:{" "}
                                                    <b>
                                                        {SUBJECTS.find((s) => s.value === exam.subject)?.label ||
                                                            exam.subject}
                                                    </b>
                                                </>
                                            )}
                                        </div>
                                    </>
                                }
                                bordered
                                style={{ marginTop: 24 }}
                            >
                                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                    {/* Thanh tiến độ */}
                                    <div style={{ textAlign: "right" }}>
                                        <Text>
                                            Đã chọn: {answeredCount}/{exam.questions.length}
                                        </Text>
                                        <Progress
                                            percent={Math.round((answeredCount / exam.questions.length) * 100)}
                                            size="small"
                                            showInfo={false}
                                            style={{ marginTop: 4 }}
                                        />
                                    </div>

                                    {/* Danh sách câu hỏi */}
                                    {exam.questions.map((q, idx) => (
                                        <Card
                                            key={q.id}
                                            size="small"
                                            type="inner"
                                            title={
                                                <>
                                                    Câu {idx + 1}: <Text strong>{q.text}</Text>{" "}
                                                    <Text type="secondary">({q.points} điểm)</Text>
                                                </>
                                            }
                                            style={{
                                                borderRadius: 8,
                                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                            }}
                                        >
                                            <Radio.Group
                                                onChange={(e) => onChoose(q.id, e.target.value)}
                                                value={answers[q.id] || ""}
                                                style={{ display: "flex", flexDirection: "column", gap: 8 }}
                                            >
                                                {(q.options || []).map((opt, i) => {
                                                    const ch = letter(i);
                                                    return (
                                                        <Radio key={i} value={ch}>
                                                            <b>{ch}.</b> {opt}
                                                        </Radio>
                                                    );
                                                })}
                                            </Radio.Group>
                                        </Card>
                                    ))}

                                    {/* Nút kết thúc */}
                                    <div style={{ textAlign: "center", marginTop: 24 }}>
                                        <Button
                                            type="primary"
                                            size="large"
                                            shape="round"
                                            icon={<SendOutlined />}
                                            onClick={doSubmit}
                                            loading={loading}
                                        >
                                            Nộp bài
                                        </Button>
                                    </div>
                                </Space>
                            </Card>
                        </>
                    )}

                    {/* SAU KHI NỘP */}
                    {result && (
                        <Card
                            style={{
                                marginTop: 16,
                                borderRadius: 8,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            }}
                        >
                            <Space direction="vertical" size={8}>
                                <Title level={4} style={{ margin: 0 }}>
                                    Kết quả thi
                                </Title>

                                <Text strong>
                                    Điểm số:&nbsp;
                                    <Tag color={result.score >= result.total_points / 2 ? "green" : "red"}>
                                        {result.score} / {result.total_points}
                                    </Tag>
                                </Text>

                                {exam?.version != null && (
                                    <Text>
                                        Mã đề:&nbsp;<Tag color="blue">{exam.version}</Tag>
                                    </Text>
                                )}

                                {exam?.subject && (
                                    <Text>
                                        Môn học:&nbsp;
                                        <Tag color="geekblue">
                                            {SUBJECTS.find((s) => s.value === exam.subject)?.label ||
                                                exam.subject}
                                        </Tag>
                                    </Text>
                                )}

                                {/* 🧭 Nút quay lại */}
                                <Button
                                    type="primary"
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => {
                                        setExam(null);
                                        setResult(null);
                                        setAnswers({});
                                    }}
                                    style={{ marginTop: 12 }}
                                >
                                    Quay lại chọn môn
                                </Button>
                            </Space>
                        </Card>
                    )}
                </div>
            </div>
            <Footer/>
        </div>
    );
}
