// src/pages/TeacherUpload.jsx
import { useState } from "react";
import { uploadBank, previewExams, publishExam } from "../api.js";
import {Card, Select, Upload, Button, Typography, InputNumber, Input, Row, Col, Divider, message, Alert,} from "antd";
import {
    UploadOutlined,
    EyeOutlined,
    CloudUploadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const letter = (i) => String.fromCharCode(65 + i);

const SUBJECTS = [
    { value: "math", label: "Toán" },
    { value: "literature", label: "Văn" },
    { value: "english", label: "Anh" },
];

export default function TeacherUpload() {
    const [file, setFile] = useState(null);
    const [bankInfo, setBankInfo] = useState(null);
    const [nQuestions, setNQuestions] = useState(10);
    const [nVersions, setNVersions] = useState(1n);
    const [seed, setSeed] = useState("");
    const [busy, setBusy] = useState(false);
    const [preview, setPreview] = useState(null);
    const [err, setErr] = useState("");
    const [okMsg, setOkMsg] = useState("");
    const [subject, setSubject] = useState("math");

    // Tỷ lệ độ khó
    const [easyPct, setEasyPct] = useState(40);
    const [midPct, setMidPct] = useState(40);
    const [hardPct, setHardPct] = useState(20);

    const getTotalQ = (info) =>
        info?.count ?? info?.total ?? info?.total_questions ?? null;

    // --- 1) Upload CSV ---
    const doUpload = async () => {
        if (!file) return;
        setBusy(true);
        setErr("");
        setOkMsg("");
        setPreview(null);
        try {
            const data = await uploadBank(file, subject);
            setBankInfo(data);
            const total = getTotalQ(data);
            setOkMsg(`✅ Đã tải ${total ?? "?"} câu.`);
            message.success("Tải ngân hàng câu hỏi thành công!");
        } catch (e) {
            setErr(e.message || "Upload thất bại");
            message.error("Upload thất bại!");
        } finally {
            setBusy(false);
        }
    };

    // --- 2) Preview đề ---
    const doPreview = async () => {
        setBusy(true);
        setErr("");
        setOkMsg("");
        setPreview(null);
        try {
            const data = await previewExams(
                Number(nQuestions),
                Number(nVersions),
                seed === "" ? null : Number(seed),
                null,
                subject
            );
            setPreview(data);
            setOkMsg("✅ Đã tạo bản xem trước.");
            message.success("Đã trộn đề xem trước!");
        } catch (e) {
            setErr(e.message || "Preview thất bại");
            message.error("Preview thất bại!");
        } finally {
            setBusy(false);
        }
    };

    // --- 3) Xuất bản ---
    const doPublish = async () => {
        setBusy(true);
        setErr("");
        setOkMsg("");
        try {
            await publishExam({
                n_questions: Number(nQuestions),
                n_versions: Number(nVersions),
                seed: seed === "" ? null : Number(seed),
                bank_path: null,
                shuffle_questions: true,
                shuffle_options: true,
                subject,
            });
            setOkMsg("🚀 Đã xuất bản các mã đề!");
            message.success("Xuất bản thành công!");
        } catch (e) {
            setErr(e.message || "Xuất bản lỗi");
            message.error("Xuất bản thất bại!");
        } finally {
            setBusy(false);
        }
    };

    const totalUploaded = getTotalQ(bankInfo);

    return (
        <div >
            <Title level={3}>📤 Tải và Trộn đề</Title>

            {/* Môn học */}
            <Card size="small" style={{ marginBottom: 16 }}>
                <Text strong>Môn:</Text>{" "}
                <Select
                    value={subject}
                    onChange={setSubject}
                    style={{ width: 200 }}
                    placeholder="Chọn môn"
                >
                    {SUBJECTS.map((s) => (
                        <Option key={s.value} value={s.value}>
                            {s.label}
                        </Option>
                    ))}
                </Select>
            </Card>

            {/* BƯỚC 1: Upload CSV */}
            <Card
                title="Bước 1: Tải đề"
                bordered
                style={{ marginBottom: 16 }}
                extra={<Text type="secondary">7 cột: id, question, options, answer...</Text>}
            >
                <Upload
                    beforeUpload={(f) => {
                        setFile(f);
                        return false;
                    }}
                    accept=".csv"
                    showUploadList={{ showRemoveIcon: false }}
                    maxCount={1}
                >
                    <Button icon={<UploadOutlined />} disabled={busy}>
                        Chọn file CSV
                    </Button>
                </Upload>

                <Button
                    type="primary"
                    onClick={doUpload}
                    disabled={!file || busy}
                    loading={busy}
                    icon={<CloudUploadOutlined />}
                    style={{ marginTop: 12 }}
                >
                    {busy ? "Đang tải lên..." : "Tải lên"}
                </Button>

                {bankInfo && (
                    <Alert
                        type="success"
                        message={`Đã tải: ${totalUploaded ?? "?"} câu`}
                        showIcon
                        style={{ marginTop: 12 }}
                    />
                )}
            </Card>

            {/* BƯỚC 2: Cấu hình & Tỷ lệ */}
            <Card title="Bước 2: Trộn & Xem trước" bordered>
                <Row gutter={16}>
                    <Col span={6}>
                        <Text strong>Số câu mỗi đề:</Text>
                        <InputNumber
                            min={1}
                            value={nQuestions}
                            onChange={setNQuestions}
                            style={{ width: "100%" }}
                        />
                    </Col>
                    <Col span={6}>
                        <Text strong>Số đề:</Text>
                        <InputNumber
                            min={1}
                            value={nVersions}
                            onChange={setNVersions}
                            style={{ width: "100%" }}
                        />
                    </Col>
                    <Col span={6}>
                        <Text strong>Seed (tùy chọn):</Text>
                        <Input
                            placeholder="(để trống nếu không dùng)"
                            value={seed}
                            onChange={(e) => setSeed(e.target.value)}
                        />
                    </Col>
                    <Col span={6} style={{ alignSelf: "end" }}>
                        <Button
                            type="default"
                            icon={<EyeOutlined />}
                            onClick={doPreview}
                            disabled={busy}
                            loading={busy}
                            block
                        >
                            {busy ? "Đang trộn..." : "Trộn & Xem trước"}
                        </Button>
                    </Col>
                </Row>

                <Divider />

                <Row gutter={12}>
                    <Col span={24}>
                        <Text strong>Tỷ lệ độ khó (%)</Text>
                        <Row gutter={16} style={{ marginTop: 8 }}>
                            <Col span={8}>
                                <Text>Dễ:</Text>{" "}
                                <InputNumber
                                    min={0}
                                    max={100}
                                    step={10}
                                    value={easyPct}
                                    onChange={setEasyPct}
                                    style={{ width: "100px", marginLeft: 4 }}
                                    formatter={(value) => `${value}%`}
                                    parser={(value) => value.replace('%', '')}
                                />
                            </Col>
                            <Col span={8}>
                                <Text>Trung bình:</Text>{" "}
                                <InputNumber
                                    min={0}
                                    max={100}
                                    step={10}
                                    value={midPct}
                                    onChange={setMidPct}
                                    style={{ width: "100px", marginLeft: 4 }}
                                    formatter={(value) => `${value}%`}
                                    parser={(value) => value.replace('%', '')}
                                />
                            </Col>
                            <Col span={8}>
                                <Text>Khó:</Text>{" "}
                                <InputNumber
                                    min={0}
                                    max={100}
                                    step={10}
                                    value={hardPct}
                                    onChange={setHardPct}
                                    style={{ width: "100px", marginLeft: 4 }}
                                    formatter={(value) => `${value}%`}
                                    parser={(value) => value.replace('%', '')}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>

            {/* Thông báo */}
            {okMsg && (
                <Alert type="success" message={okMsg} showIcon style={{ marginTop: 16 }} />
            )}
            {err && (
                <Alert
                    type="error"
                    message={err}
                    showIcon
                    style={{ marginTop: 16 }}
                />
            )}

            {/* PREVIEW */}
            {preview && (
                <Card
                    title="Bản xem trước đề thi"
                    bordered
                    style={{ marginTop: 16 }}
                    extra={
                        <Button
                            type="primary"
                            onClick={doPublish}
                            loading={busy}
                            disabled={busy}
                            icon={<CloudUploadOutlined />}
                        >
                            Xuất bản
                        </Button>
                    }
                >
                    <Text>
                        Môn: {subject} — Tổng câu: {preview.total ?? "—"} — Mỗi đề:{" "}
                        {preview.n_questions ?? "—"} — Số mã: {preview.n_versions ?? "—"}
                    </Text>

                    <Divider />

                    <Row gutter={[12, 12]}>
                        {preview.versions?.map((v) => (
                            <Col span={12} key={v.version}>
                                <Card
                                    size="small"
                                    title={`Đề ${v.version}`}
                                    bordered
                                    style={{ height: "100%" }}
                                >
                                    <ol>
                                        {v.questions.map((q) => (
                                            <li key={q.id} style={{ marginBottom: 8 }}>
                                                <Text strong>{q.text}</Text>
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
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card>
            )}
        </div>
    );
}
