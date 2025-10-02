// src/pages/Login.jsx
import { useState } from "react";
import { login } from "../api.js";

export default function Login({ onLogin }) {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      // lấy đúng dữ liệu user từ BE: {code, name, role}
      const u = await login(code.trim(), password);
      onLogin?.(u);                  // <-- quan trọng: truyền user vào App
    } catch (e) {
      setErr(e.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ padding: 16, display: "grid", gap: 8 }}>
      <h2>Đăng nhập</h2>
      <input
        placeholder="Mã (S1/T1…)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        autoComplete="username"
        required
      />
      <input
        placeholder="Mật khẩu"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />
      <button type="submit" disabled={loading || !code || !password}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
      {err && <p style={{ color: "crimson", marginTop: 4 }}>{err}</p>}
    </form>
  );
}
