
import { useEffect, useRef, useState } from "react";
import {
  Camera,
  RotateCcw,
  Download,
  Sparkles,
  Heart,
} from "lucide-react";

const PHOTO_COUNT = 4;

export default function App() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      } catch {
        setError(
          "Camera access was blocked. Allow camera permission in your browser, then refresh this page."
        );
      }
    }

    startCamera();

    return () => {
      active = false;
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function takePhoto() {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext("2d");
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", 0.92);
  }

  function startSession() {
    if (!cameraReady || capturing) return;

    setPhotos([]);
    setCapturing(true);
    let shot = 0;
    let seconds = 3;

    setCountdown(seconds);
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      seconds -= 1;

      if (seconds > 0) {
        setCountdown(seconds);
        return;
      }

      const photo = takePhoto();

      if (photo) {
        setPhotos((previous) => [...previous, photo]);
        shot += 1;
      }

      if (shot >= PHOTO_COUNT) {
        clearInterval(timerRef.current);
        setCountdown(null);
        setCapturing(false);
      } else {
        seconds = 3;
        setCountdown(seconds);
      }
    }, 1000);
  }

  function cancelSession() {
    clearInterval(timerRef.current);
    setCountdown(null);
    setCapturing(false);
    setPhotos([]);
  }

  function downloadStrip() {
    if (photos.length !== PHOTO_COUNT) return;

    const images = photos.map(
      (src) =>
        new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = src;
        })
    );

    Promise.all(images).then((loaded) => {
      const canvas = document.createElement("canvas");
      const width = 600;
      const padding = 28;
      const photoWidth = width - padding * 2;
      const photoHeight = 340;
      const gap = 16;
      const header = 130;
      const footer = 100;

      canvas.width = width;
      canvas.height =
        header + PHOTO_COUNT * photoHeight +
        (PHOTO_COUNT - 1) * gap + footer;

      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, width, canvas.height);
      gradient.addColorStop(0, "#f1edff");
      gradient.addColorStop(1, "#e6f4ff");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, canvas.height);

      ctx.fillStyle = "#75669e";
      ctx.textAlign = "center";
      ctx.font = "bold 36px sans-serif";
      ctx.fillText("WE GO-6 ♡", width / 2, 58);
      ctx.font = "18px sans-serif";
      ctx.fillText("little moments, lovely memories", width / 2, 94);

      loaded.forEach((image, index) => {
        const y = header + index * (photoHeight + gap);
        ctx.save();
        ctx.shadowColor = "rgba(100, 90, 140, 0.18)";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(padding, y, photoWidth, photoHeight);
        ctx.restore();

        const scale = Math.max(
          photoWidth / image.width,
          photoHeight / image.height
        );
        const cropWidth = photoWidth / scale;
        const cropHeight = photoHeight / scale;
        const sx = (image.width - cropWidth) / 2;
        const sy = (image.height - cropHeight) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.rect(padding, y, photoWidth, photoHeight);
        ctx.clip();
        ctx.drawImage(
          image, sx, sy, cropWidth, cropHeight,
          padding, y, photoWidth, photoHeight
        );
        ctx.restore();
      });

      ctx.fillStyle = "#75669e";
      ctx.font = "20px sans-serif";
      ctx.fillText("♡  made with WE GO-6  ♡", width / 2, canvas.height - 35);

      const link = document.createElement("a");
      link.download = "wego6-photo-strip.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }).catch(() => {
      setError("Sorry, the photo strip could not be created. Please try again.");
    });
  }

  return (
    <main className="booth">
      <header className="topbar">
        <div className="brand">
          <Sparkles size={20} />
          <span>WE GO-6</span>
          <Heart size={17} />
        </div>
        <p>your little corner of memories</p>
      </header>

      <section className="workspace">
        <div className="camera-panel">
          <div className="section-heading">
            <h1>Let's take four!</h1>
            <p>Get comfy, find your pose, and smile ♡</p>
          </div>

          <div className="camera-frame">
            <video
              ref={videoRef}
              className="camera-video"
              autoPlay
              muted
              playsInline
            />
            {!cameraReady && !error && (
              <div className="camera-overlay">
                <Camera size={36} />
                <p>Waking up the camera...</p>
              </div>
            )}
            {countdown !== null && (
              <div className="countdown">{countdown}</div>
            )}
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="controls">
            <button
              className="primary-button"
              onClick={startSession}
              disabled={!cameraReady || capturing}
            >
              <Camera size={19} />
              {capturing ? "Say cheese!" : "Start photo session"}
            </button>
            <button
              className="secondary-button"
              onClick={cancelSession}
              disabled={!capturing && photos.length === 0}
            >
              <RotateCcw size={17} />
              Start over
            </button>
          </div>
          <p className="hint">4 photos · 3-second countdown · just for you</p>
        </div>

        <aside className="strip-panel">
          <div className="section-heading">
            <h2>Your photo strip</h2>
            <p>{photos.length} of {PHOTO_COUNT} captured</p>
          </div>

          <div className="photo-strip">
            <div className="strip-title">WE GO-6 ♡</div>
            {Array.from({ length: PHOTO_COUNT }, (_, index) => (
              <div className="photo-slot" key={index}>
                {photos[index] ? (
                  <img src={photos[index]} alt={`Photo ${index + 1}`} />
                ) : (
                  <div className="empty-slot">
                    <Camera size={23} />
                    <span>PHOTO {index + 1}</span>
                  </div>
                )}
              </div>
            ))}
            <div className="strip-footer">♡ lovely little memories ♡</div>
          </div>

          <button
            className="download-button"
            onClick={downloadStrip}
            disabled={photos.length !== PHOTO_COUNT}
          >
            <Download size={18} />
            Download photo strip
          </button>
          <p className="hint">Your photos stay in this browser session.</p>
        </aside>
      </section>

      <footer className="page-footer">
        made with ♡ and a little lavender
      </footer>
    </main>
  );
}
