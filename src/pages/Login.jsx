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
          <section className="vh-100">
            <div className="container-fluid">
              <div className="row">
                <div className="col-sm-6 text-black">
                    <div className="px-5 ms-xl-4 d-flex align-items-center gap-3 pt-5 mt-xl-4">
                        <img
                            src="https://i.pinimg.com/736x/5d/70/30/5d70306c8ceb0a80844ff10c839c51b2.jpg"
                            alt="Logo"
                            style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }}
                        />
                        <span className="h1 fw-bold mb-0">Exam</span>
                    </div>


                    <div className="d-flex align-items-center h-custom-2 px-5 ms-xl-4 mt-5 pt-5 pt-xl-0 mt-xl-n5">
                        <form style={{width: "23rem"}} onSubmit={submit}>
                            <h2 className="fw-normal mb-3 pb-3" style={{letterSpacing: 1}}>
                                Đăng nhập
                            </h2>
                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    id="form2Example18"
                                    className="form-control"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                />
                                <label className="form-label" htmlFor="form2Example18">
                                    Mã (S1/T1…)
                                </label>
                            </div>

                            <div className="form-floating mb-3">
                                <input
                                    type="password"
                                    id="form2Example28"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <label className="form-label" htmlFor="form2Example28">
                                    Mật khẩu
                                </label>
                            </div>

                            <div className="pt-1 mb-4">
                                <button
                                    style={{background : "#a3a3a3"}}
                                    className="btn btn-lg btn-block"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                                </button>
                            </div>

                            {err && <p style={{color: "crimson", marginTop: 4}}>{err}</p>}
                        </form>
                    </div>
                </div>

                  <div className="col-sm-6 px-0 d-none d-sm-block">
                      <img
                          src="https://i.pinimg.com/736x/a3/5e/7e/a35e7ee1e38e36db48b0d7aef5b19409.jpg"
                    alt="Login image"
                    className="w-100 vh-100"
                    style={{ objectFit: "cover", objectPosition: "left" }}
                  />
                </div>
              </div>
            </div>
          </section>

  );
}
