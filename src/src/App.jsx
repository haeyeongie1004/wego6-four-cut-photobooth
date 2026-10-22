
import { useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, Sparkles, Download } from "lucide-react";

export default function App() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [message, setMessage] = useState("Your four-cut story starts here.");

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraReady(true);
      setMessage("Camera ready! You're looking lovely.");
    } catch {
      setMessage("Camera unavailable. Please allow camera access and try again.");
    }
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function takePhoto() {
    if (!cameraReady || countdown !== null || photos.length >= 4) return;

    for (let number = 3; number >= 1; number--) {
      setCountdown(number);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setCountdown("♡");
    await new Promise((resolve) => setTimeout(resolve, 350));

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photo = canvas.toDataURL("image/jpeg", 0.92);
    setPhotos((current) => [...current, photo]);
    setCountdown(null);
    setMessage("Cute! One memory captured.");
  }

  function resetPhotos() {
    setPhotos([]);
    setCountdown(null);
    setMessage("Ready for a fresh four-cut story?");
  }

  function downloadPhotos() {
    if (photos.length === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1800;
    const context = canvas.getContext("2d");

    context.fillStyle = "#f1edff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const gap = 24;
    const margin = 90;
    const photoWidth = canvas.width - margin * 2;
    const photoHeight = 360;

    Promise.all(
      photos.map(
        (photo) =>
          new Promise((resolve) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.src = photo;
          })
      )
    ).then((images) => {
      images.forEach((image, index) => {
        const y = 100 + index * (photoHeight + gap);
        context.save();
        context.beginPath();
        context.roundRect(margin, y, photoWidth, photoHeight, 22);
        context.clip();

        const scale = Math.max(
          photoWidth / image.width,
          photoHeight / image.height
        );
        const width = image.width * scale;
        const height = image.height * scale;

        context.drawImage(
          image,
          (canvas.width - width) / 2,
          y + (photoHeight - height) / 2,
          width,
          height
        );
        context.restore();
      });

      context.fillStyle = "#77709d";
      context.textAlign = "center";
      context.font = "bold 48px sans-serif";
      context.fillText("WE GO-6 ♡", 600, 1740);

      const link = document.createElement("a");
      link.download = "wego6-four-cut.jpg";
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
    });
  }

  return (
    <main className="page">
      <div className="sparkle sparkle-one">✦</div>
      <div className="sparkle sparkle-two">✧</div>

      <header className="header">
        <div className="logo-mark">W6</div>
        <p className="eyebrow">YOUR LITTLE MEMORY STUDIO</p>
        <h1>WE GO-6</h1>
        <p className="subtitle">four cuts, one lovely memory ♡</p>
      </header>

      <section className="studio">
        <div className="studio-heading">
          <span className="live-dot" />
          <span>THE PHOTO STUDIO</span>
          <Sparkles size={17} />
        </div>

        <div className="camera-area">
          <video
            ref={videoRef}
            className="camera-video"
            autoPlay
            muted
            playsInline
          />

          {!cameraReady && (
            <div className="camera-placeholder">
              <div className="camera-icon">
                <Camera size={34} strokeWidth={1.4} />
              </div>
              <p>Your camera moment awaits</p>
              <span>Allow camera access to begin</span>
            </div>
          )}

          {countdown !== null && (
            <div className="countdown">{countdown}</div>
          )}
        </div>

        <p className="message">{message}</p>

        <div className="controls">
          {!cameraReady ? (
            <button className="primary-button" onClick={startCamera}>
              <Camera size={18} /> Start camera
            </button>
          ) : (
            <button
              className="primary-button"
              onClick={takePhoto}
              disabled={countdown !== null || photos.length >= 4}
            >
              <Camera size={18} />
              {photos.length >= 4 ? "All four captured!" : "Take photo"}
            </button>
          )}

          <button className="secondary-button" onClick={resetPhotos}>
            <RotateCcw size={16} /> Retake all
          </button>
        </div>

        <div className="progress">
          {[0, 1, 2, 3].map((index) => (
            <div
              className={`progress-item ${photos[index] ? "filled" : ""}`}
              key={index}
            >
              {photos[index] ? (
                <img src={photos[index]} alt={`Captured photo ${index + 1}`} />
              ) : (
                <span>{String(index + 1).padStart(2, "0")}</span>
              )}
            </div>
          ))}
        </div>

        <div className="progress-label">
          <span>YOUR FOUR CUTS</span>
          <span>{photos.length} / 4 captured</span>
        </div>

        {photos.length > 0 && (
          <button className="download-button" onClick={downloadPhotos}>
            <Download size={17} /> Download your photos
          </button>
        )}
      </section>

      <footer>
        <span>MADE OF LITTLE MOMENTS</span>
        <span>♡ WE GO-6 ♡</span>
      </footer>
    </main>
  );
}
