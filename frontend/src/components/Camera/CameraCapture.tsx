import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

import './CameraCapture.css';

const CameraCapture = ({ onEmotionDetected, currentPostId }: { onEmotionDetected: (emotion: string) => void, currentPostId: string | null }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState<boolean>(false);
    const intervalRef = useRef<number | null>(null);
    const [imageCount, setImageCount] = useState<number>(0);
    const [imageList, setImageList] = useState<string[]>([]);
    const [isCapturing, setIsCapturing] = useState<boolean>(false);

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
        const handleScrollDown = async (event: WheelEvent) => {
            if (event.deltaY > 100 && !isCapturing) {
                console.log('Scroll vers le bas détecté');
                setIsCapturing(true);
                await new Promise((resolve) => setTimeout(resolve, 2500)); // Delay of 4,5 second
                captureMultipleImages(currentPostId);
            }
        };

        // const handleLoad = async (event: Event) => {
        //     console.log('Page rafraîchie', event);
        //     if (!isCapturing) {
        //         console.log('Page rafraîchie');
        //         setIsCapturing(true);
        //         await new Promise((resolve) => setTimeout(resolve, 1500)); // Delay of 4,5 second
        //         captureMultipleImages(currentPostId);
        //     }
        // };

        window.addEventListener('wheel', handleScrollDown);
        return () => {
            window.removeEventListener('wheel', handleScrollDown);
            // window.removeEventListener('load', handleLoad);
        };
    }, [isCapturing, currentPostId]);

    const captureMultipleImages = async (postId: string | null) => {
        if (!postId) return;

        const images: string[] = [];
        for (let i = 0; i < 20; i++) {
            const imageDataUrl = captureImage();
            if (imageDataUrl) {
                images.push(imageDataUrl.replace(/^data:image\/jpeg;base64,/, ''));
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        setImageList(images);
        console.log(imageList);
        await postImages(images, postId);
        setIsCapturing(false);
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
        }
    };

    const captureImage = (): string | null => {
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
                return imageDataUrl;
            }
        }
        return null;
    };

    const postImages = async (images: string[], postId: string) => {
        try {
            const res = await axios.post('http://localhost:5050/score-batch-maximum', { image: images, postId });
            console.log('Images successfully analyzed', res.data.result["most_prevalent_emotion"]);
            onEmotionDetected(res.data.result["most_prevalent_emotion"]);
        } catch (error) {
            console.error('Error posting images:', error);
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
