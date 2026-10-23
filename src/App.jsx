
import { useEffect, useRef, useState } from "react";
import {
  Camera,
  RotateCcw,
  Download,
  Sparkles,
  Heart,
  ArrowRight,
  Check,
} from "lucide-react";


const POSES = [
  {
    title: "The Signature Pose",
    tip: "Copy the pose from your guide! ♡",
    guide: "✌️",
    guideLabel: "POSE 01",
  },
  {
    title: "Peace & Love",
    tip: "Make a peace sign and smile! ✌️",
    guide: "✌️ 💗",
    guideLabel: "POSE 02",
  },
  {
    title: "Cheeky Moment",
    tip: "Try a cute cheek pose! ♡",
    guide: "🥹 🫶",
    guideLabel: "POSE 03",
  },
  {
    title: "Bestie Finale",
    tip: "Finish with your favourite pose!",
    guide: "🫰 💕",
    guideLabel: "POSE 04",
  },
];


export default function App() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState([null, null, null, null]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [counting, setCounting] = useState(false);
  const [finished, setFinished] = useState(false);

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
          "Camera access is needed. Please allow camera permission and refresh."
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

  
async function capturePhoto() {
  const video = videoRef.current;

  if (!video || video.readyState < 2) {
    setError("The camera is not ready yet. Please try again.");
    return null;
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Couldn't capture the photo. Please try again.");
      return null;
    }

    // Draw the mirrored webcam photo first.
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    
const scale = Math.min(
  canvas.width / frame.width,
  canvas.height / frame.height
);

const frameWidth = frame.width * scale;
const frameHeight = frame.height * scale;

ctx.drawImage(
  frame,
  (canvas.width - frameWidth) / 2,
  (canvas.height - frameHeight) / 2,
  frameWidth,
  frameHeight
);

    ctx.restore();

    // Load the frame PNG for the current photo.
    const frame = new Image();
    frame.src = `/frame-${currentFrame + 1}.png`;

    await new Promise((resolve, reject) => {
      frame.onload = resolve;
      frame.onerror = reject;
    });

    // Overlay the transparent frame on top of the webcam photo.
    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", 0.92);
  } catch (error) {
  console.error("Frame capture error:", error);
  setError(`Couldn't add the frame: ${error.message || "Unknown error"}`);
  return null;
}
}

  async function startCountdown() {
    if (!cameraReady || counting || finished) return;

    setError("");
    setCounting(true);
    let seconds = 3;
    setCountdown(seconds);

    clearInterval(timerRef.current);
    timerRef.current = setInterval(async () => {
      seconds -= 1;

      if (seconds > 0) {
        setCountdown(seconds);
        return;
      }

      clearInterval(timerRef.current);

      const photoPromise = capturePhoto();
      setCountdown(null);
      setCounting(false);

      const photo = await photoPromise;
if (!photo) return;

      setPhotos((previous) => {
        const updated = [...previous];
        updated[currentFrame] = photo;
        return updated;
      });
    }, 1000);
  }

  function retakeFrame() {
    clearInterval(timerRef.current);
    setCountdown(null);
    setCounting(false);
    setFinished(false);
    setPhotos((previous) => {
      const updated = [...previous];
      updated[currentFrame] = null;
      return updated;
    });
  }

  function goToNextFrame() {
    if (!photos[currentFrame]) return;

    if (currentFrame === 3) {
      setFinished(true);
      return;
    }

    setCurrentFrame((previous) => previous + 1);
  }

  function startOver() {
    clearInterval(timerRef.current);
    setPhotos([null, null, null, null]);
    setCurrentFrame(0);
    setCountdown(null);
    setCounting(false);
    setFinished(false);
    setError("");
  }

  async function downloadStrip() {
    if (photos.some((photo) => !photo)) return;

    try {
      const images = await Promise.all(
        photos.map(
          (src) =>
            new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = src;
            })
        )
      );

      const width = 600;
      const padding = 28;
      const photoWidth = width - padding * 2;
      const photoHeight = 340;
      const gap = 16;
      const header = 130;
      const footer = 100;
      const height =
        header + 4 * photoHeight + 3 * gap + footer;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#f1edff");
      gradient.addColorStop(1, "#e6f4ff");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#75669e";
      ctx.textAlign = "center";
      ctx.font = "bold 36px sans-serif";
      ctx.fillText("WE GO-6 ♡", width / 2, 58);
      ctx.font = "18px sans-serif";
      ctx.fillText("little moments, lovely memories", width / 2, 94);

      images.forEach((img, index) => {
        const y = header + index * (photoHeight + gap);
        const scale = Math.max(
          photoWidth / img.width,
          photoHeight / img.height
        );
        const cropWidth = photoWidth / scale;
        const cropHeight = photoHeight / scale;

        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(100, 90, 140, 0.18)";
        ctx.shadowBlur = 12;
        ctx.fillRect(padding, y, photoWidth, photoHeight);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.rect(padding, y, photoWidth, photoHeight);
        ctx.clip();
        ctx.drawImage(
          img,
          (img.width - cropWidth) / 2,
          (img.height - cropHeight) / 2,
          cropWidth,
          cropHeight,
          padding,
          y,
          photoWidth,
          photoHeight
        );
        ctx.restore();
      });

      ctx.fillStyle = "#75669e";
      ctx.font = "20px sans-serif";
      ctx.fillText("♡ made with WE GO-6 ♡", width / 2, height - 35);

      const link = document.createElement("a");
      link.download = "wego6-photo-strip.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      setError("We couldn't create your strip. Please try again.");
    }
  }

  const currentPhoto = photos[currentFrame];

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

      <div className="progress">
        {POSES.map((pose, index) => (
          <div
            key={pose.title}
            className={`progress-step ${
              index === currentFrame ? "active" : ""
            } ${photos[index] ? "complete" : ""}`}
          >
            <span>{photos[index] ? <Check size={16} /> : index + 1}</span>
            <small>FRAME {index + 1}</small>
          </div>
        ))}
      </div>

      <section className="workspace">
        <div className="camera-panel">
          <div className="section-heading">
            <h1>{finished ? "You did it! ♡" : POSES[currentFrame].title}</h1>
            <p>
              {finished
                ? "Your four-cut memories are ready!"
                : POSES[currentFrame].tip}
            </p>
          </div>

          
<div className="pose-guide">
  <span className="pose-guide-label">
    {POSES[currentFrame].guideLabel}
  </span>
  <div className="pose-guide-art">
    {POSES[currentFrame].guide}
  </div>
  <p>POSE LIKE YOUR IDOL ♡</p>
  <small>Placeholder guide · Replace later</small>
</div>


<div className="camera-frame">
  <video
    ref={videoRef}
    className="camera-video"
    autoPlay
    muted
    playsInline
  />

<img
  className="frame-overlay"
  src={`/frame-${currentFrame + 1}.png`}
  alt=""
  aria-hidden="true"
  draggable="false"
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

  {currentPhoto && !counting && (
    <div className="captured-label">
      <Check size={16} /> Frame captured!
    </div>
  )}
</div>


          {error && <p className="error-message">{error}</p>}

          <div className="controls">
            {!finished && !currentPhoto && (
              <button
                className="primary-button"
                onClick={startCountdown}
                disabled={!cameraReady || counting}
              >
                <Camera size={19} />
                {counting ? `Smile in ${countdown ?? 0}...` : "Ready? Start 3s countdown"}
              </button>
            )}

            {!finished && currentPhoto && (
              <>
                <button
                  className="secondary-button"
                  onClick={retakeFrame}
                  disabled={counting}
                >
                  <RotateCcw size={17} />
                  Retake this frame
                </button>
                <button className="primary-button" onClick={goToNextFrame}>
                  {currentFrame === 3 ? "Finish photo strip" : "Next pose"}
                  <ArrowRight size={18} />
                </button>
              </>
            )}

            {finished && (
              <button className="primary-button" onClick={downloadStrip}>
                <Download size={18} />
                Download photo strip
              </button>
            )}

            <button className="secondary-button" onClick={startOver}>
              <RotateCcw size={17} />
              Start over
            </button>
          </div>

          <p className="hint">
            One pose at a time · You control the countdown · 5 seconds to pose
          </p>
        </div>

        <aside className="strip-panel">
          <div className="section-heading">
            <h2>Your photo strip</h2>
            <p>{photos.filter(Boolean).length} of 4 photos captured</p>
          </div>

          <div className="photo-strip">
            <div className="strip-title">WE GO-6 ♡</div>
            {photos.map((photo, index) => (
              <div className="photo-slot" key={index}>
                {photo ? (
                  <img src={photo} alt={`Photo ${index + 1}`} />
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
            disabled={photos.some((photo) => !photo)}
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
