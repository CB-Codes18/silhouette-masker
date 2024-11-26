// Posedetection.js
import React, { useEffect, useRef, useState } from 'react';

const FaceDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [message, setMessage] = useState('');
  const silhouetteImage = new Image();
  silhouetteImage.src = 'silhouette.png'; // Make sure this path is correct

  useEffect(() => {
    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      ]);
      startVideo();
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error(err));
    };

    loadModels();
  }, []);

  useEffect(() => {
    const handleVideoPlay = async () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const displaySize = {
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      };
      faceapi.matchDimensions(canvas, displaySize);

      // Fixed position and size for the silhouette
      const silhouetteWidth = 200; // Adjust as needed
      const silhouetteHeight = 200; // Adjust as needed
      const silhouetteX = (displaySize.width - silhouetteWidth) / 2;
      const silhouetteY = (displaySize.height - silhouetteHeight) / 2;

      setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the silhouette image at a fixed position
        ctx.drawImage(silhouetteImage, silhouetteX, silhouetteY, silhouetteWidth, silhouetteHeight);

        if (resizedDetections.length > 0) {
          const { width } = resizedDetections[0].detection.box;
          const tooCloseThreshold = 100; // Adjust as needed
          const tooFarThreshold = 300; // Adjust as needed

          if (width < tooCloseThreshold) {
            setMessage('Move Backward');
          } else if (width > tooFarThreshold) {
            setMessage('Move Forward');
          } else {
            setMessage('');
          }
        }

        // Optional: Draw face detections for debugging purposes
        faceapi.draw.drawDetections(canvas, resizedDetections);
      }, 100);
    };

    videoRef.current.addEventListener('play', handleVideoPlay);
    return () => {
      videoRef.current.removeEventListener('play', handleVideoPlay);
    };
  }, [videoRef]);

  return (
    <div style={{ position: 'relative' }}>
      <video ref={videoRef} autoPlay muted style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '24px',
          textAlign: 'center',
        }}
      >
        {message}
      </div>
    </div>
  );
};

export default FaceDetection;
