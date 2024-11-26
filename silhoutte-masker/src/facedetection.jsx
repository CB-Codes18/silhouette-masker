// Posedetection.js
import React,{useEffect, useRef ,useState} from "react";
import * as tf from '@tensorflow/tfjs';
import { createDetector, SupportedModels } from "@tensorflow-models/pose-detection";

const Posedetection = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [message, setMessage] = useState('');
    const [detector, setDetector] = useState(null);


    useEffect (() => {
        const loadModel = async () => {
            const model = await createDetector(SupportedModels.MoveNet);
            setDetector (model);
            startVideo();
        };

        const startVideo = () => {
            navigator.mediaDevices.getUserMedia({video : true})
            .then(stream => {
                videoRef.current.srcObject = stream;
            })
            .catch(err => console.error(err));
        };

        loadModel();
    }, []);
    useEffect(() => {
        const handleVideoPlay = async () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');

          const detectPose = async () => {
            if (detector) {
                const poses = await detector.estimatePoses(videoRef.current);
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (poses.length > 0) {
            const keypoints = poses[0].keypoints;
            const nose = keypoints[0]; // Using the nose keypoint for distance estimation

            if (nose.score > 0.5) {
                const width = videoRef.current.videoWidth;
              const height = videoRef.current.videoHeight;
              const noseX = nose.x * width;
              const noseY = nose.y * height;

              // Define thresholds for too close and too far
              const tooCloseThreshold = 100; // Adjust this value as needed
              const tooFarThreshold = 300; // Adjust this value as needed

              // Calculate distance based on nose position
              if (noseY < tooCloseThreshold) {
                setMessage('Move Backward');
              } else if (noseY > height - tooFarThreshold) {
                setMessage('Move Forward');
              } else {
                setMessage('');
              }

              // Draw Keypoints
              ctx.fillStyle = 'red';
              ctx.beginPath();
              ctx.arc(noseX, noseY, 5, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        }
        tAnimationFrame(detectPose);
      };

      detectPose();
    };

    videoRef.current.addEventListener('play', handleVideoPlay);
    return () => {
      videoRef.current.removeEventListener('play', handleVideoPlay);
    };
  }, [detector]);
  return (
    <div>
      <video ref={videoRef} autoPlay style={{ display: 'none' }} />
      <canvas ref={canvasRef} />
      <div style={{ position: 'absolute', color: 'white', fontSize: '24px', textAlign: 'center' }}>
        {message}
      </div>
    </div>
  );

};

export default facedetection.js;
  
