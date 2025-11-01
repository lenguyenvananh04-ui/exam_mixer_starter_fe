import React from "react";

export default function Footer() {
    return (
        <footer className="text-center text-lg-start bg-light text-muted mt-5 border-top">
            {/* Section: Social media */}
            <section className="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">
                {/* Left */}
                <div className="me-5 d-none d-lg-block">
                    <span>Kết nối với chúng tôi qua mạng xã hội:</span>
                </div>
                {/* Right */}
                <div>
                    <a href="#!" className="me-4 text-reset">
                        <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="#!" className="me-4 text-reset">
                        <i className="fab fa-twitter"></i>
                    </a>
                    <a href="#!" className="me-4 text-reset">
                        <i className="fab fa-instagram"></i>
                    </a>
                    <a href="#!" className="me-4 text-reset">
                        <i className="fab fa-github"></i>
                    </a>
                </div>
            </section>

            {/* Section: Links */}
            <section>
                <div className="container text-center text-md-start mt-5">
                    <div className="row mt-3">
                        {/* Cột 1 - Thông tin ứng dụng */}
                        <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
                            <h6 className="text-uppercase fw-bold mb-4">
                                <i className="fas fa-graduation-cap me-3"></i>
                                ExamOnline
                            </h6>
                            <p>
                                Hệ thống thi trắc nghiệm trực tuyến giúp học sinh, sinh viên luyện tập, tạo và trộn đề
                                thi, đồng thời làm bài kiểm tra nhanh chóng, chính xác và minh bạch.
                            </p>
                        </div>

                        {/* Cột 2 - Mục chính */}
                        <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
                            <h6 className="text-uppercase fw-bold mb-4">Tính năng</h6>
                            <p>
                                <a href="#!" className="text-reset">Làm bài thi</a>
                            </p>
                            <p>
                                <a href="#!" className="text-reset">Xem kết quả</a>
                            </p>
                            <p>
                                <a href="#!" className="text-reset">Thống kê điểm</a>
                            </p>
                            <p>
                                <a href="#!" className="text-reset">Tạo đề kiểm tra</a>
                            </p>
                        </div>

                        {/* Cột 3 - Hỗ trợ */}
                        <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
                            <h6 className="text-uppercase fw-bold mb-4">Liên kết hữu ích</h6>
                            <p>
                                <a href="#!" className="text-reset">Trợ giúp</a>
                            </p>
                            <p>
                                <a href="#!" className="text-reset">Câu hỏi thường gặp</a>
                            </p>
                            <p>
                                <a href="#!" className="text-reset">Điều khoản sử dụng</a>
                            </p>
                            <p>
                                <a href="#!" className="text-reset">Chính sách bảo mật</a>
                            </p>
                        </div>

                        {/* Cột 4 - Liên hệ */}
                        <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
                            <h6 className="text-uppercase fw-bold mb-4">Liên hệ</h6>
                            <p><i className="fas fa-home me-3"></i> Hà Nội, Việt Nam</p>
                            <p><i className="fas fa-envelope me-3"></i> support@examonline.vn</p>
                            <p><i className="fas fa-phone me-3"></i> +84 987 654 321</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Copyright */}
            <div className="text-center p-4 bg-body-tertiary border-top">
                © 2025 Bản quyền thuộc về&nbsp;
                <a className="text-reset fw-bold" href="#!">ExamOnline.vn</a>
            </div>
        </footer>
    );
}
