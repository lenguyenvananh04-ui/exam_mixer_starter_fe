import React from "react";
import { Carousel } from "antd";

export default function Navbar() {
    const images = [
        "https://i.pinimg.com/736x/0e/59/10/0e5910d73dfcff0ec0373e83d5ed11cf.jpg",
        "https://i.pinimg.com/736x/c6/bb/78/c6bb782e11d28bd92b4d99cf9397a043.jpg",
        "https://i.pinimg.com/736x/5d/ef/5d/5def5d26b5d34685ecc9014da9a80965.jpg",
        "https://i.pinimg.com/736x/53/9e/6a/539e6a60bc42ef5ff7041ef59c510adc.jpg",
    ];
    return (
        <div className="container">
            <Carousel
                autoplay
                dots={true}
                autoplaySpeed={4000}
                style={{ overflow: "hidden" }}
            >
                {images.map((src, idx) => (
                    <div key={idx}>
                        <img
                            src={src}
                            alt={`Slide ${idx + 1}`}
                            style={{
                                width: "100%",
                                height: "350px",
                                objectFit: "contain",
                                backgroundColor: "#f8f8f8",
                            }}
                        />
                    </div>
                ))}
            </Carousel>
        </div>

    )
}