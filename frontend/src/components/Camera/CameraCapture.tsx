import { useEffect, useRef, useState } from 'react';

import './CameraCapture.css';

const CameraCapture = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState<boolean>(false);
    const intervalRef = useRef<number | null>(null);
    const [imageCount, setImageCount] = useState<number>(0);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 320, height: 240 },
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setCameraActive(true);
                }
            } catch (err) {
                console.error("Erreur d'accès à la caméra:", err);
            }
        };

        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                const tracks = stream.getTracks();
                tracks.forEach((track) => track.stop());
            }

            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (cameraActive) {
            intervalRef.current = window.setInterval(() => {
                captureMultipleImages();
            }, 300);
        }

        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, [cameraActive]);

    useEffect(() => {
        const handleScrollDown = async (event: WheelEvent) => {
            if (event.deltaY > 100) {
                console.log('Scroll vers le bas détecté');
                await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay of 5 second
                captureMultipleImages();
            }
        };

        window.addEventListener('wheel', handleScrollDown);

        return () => {
            window.removeEventListener('wheel', handleScrollDown);
        };
    }, []);

    const captureMultipleImages = async () => {
        let i = 0;
        for (i = 0; i < 10; i++) {
            captureImage();
            await new Promise((resolve) => setTimeout(resolve, 350));

        }
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
        }
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageDataUrl = canvas.toDataURL('image/jpeg');
                setCapturedImage(imageDataUrl);
                setImageCount((prevCount) => prevCount + 1);
                console.log(`Image ${imageCount + 1}: ${imageDataUrl}`); // Log the base64 image with count
            }
        }
    };

    return (
        <div className="camera-capture">
            <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {capturedImage && (
                <div className="captured-image-container">
                    <img src={capturedImage || undefined} alt="Capture de caméra" className="captured-image" />
                </div>
            )}
        </div>
    );
};

export default CameraCapture;
