import React from 'react'
import '../css/header.css'
import { Dropdown, Space } from "antd";
import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { IoLogOutOutline } from 'react-icons/io5';

export default function Header ({user, onLogout}) {
    const items = [
        {
            key: "info",
            label: (
                <div>
                    <div><b>Người dùng:</b> {user?.name || "N/A"}</div>
                    <div><b>Mã:</b> {user?.code || "N/A"}</div>
                    <div><b>Vai trò:</b> {user?.role || "N/A"}</div>
                </div>
            ),
            disabled: true,
        },
        { type: "divider" },
        {
            key: "logout",
            label: (
                <span style={{ color: "red" }}>
          <LogoutOutlined /> Đăng xuất
        </span>
            ),
        },
    ];

    const handleMenuClick = ({ key }) => {
        if (key === "logout" && onLogout) {
            onLogout();
        }
    };
    return (
        <div className='bg-color-header py-2'>
            <div className='container' >
                <div className='container d-flex justify-content-between align-items-center' >
                    <div className="d-flex align-items-center">
                        <img
                            src="https://i.pinimg.com/736x/2f/a4/31/2fa4319776ed5d9e2122b95eed0137c7.jpg"
                            alt="Logo"
                            style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 10 }}
                        />
                        <h5 className="mb-0 fw-bold">ExamOnline</h5>
                    </div>

                    <Dropdown menu={{ items, onClick: handleMenuClick }} placement="bottomRight" trigger={["click"]}>
                        <a onClick={(e) => e.preventDefault()} style={{color: "black"}}>
                            <Space>
                                <UserOutlined style={{ fontSize: 18 }} />
                                {user?.name || "Người dùng"}
                                <DownOutlined />
                            </Space>
                        </a>
                    </Dropdown>
                </div>
            </div >
        </div >

    )
}
