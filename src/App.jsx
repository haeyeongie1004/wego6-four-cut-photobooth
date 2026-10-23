
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
    // Use a consistent horizontal 4:3 photo format.
canvas.width = 1200;
canvas.height = 900;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setError("Couldn't capture the photo. Please try again.");
      return null;
    }

    
    // Crop the camera image to a horizontal 16:9 shape.
    const sourceWidth = video.videoWidth;
    const sourceHeight = video.videoHeight;
    const targetRatio = canvas.width / canvas.height;
    const sourceRatio = sourceWidth / sourceHeight;

    let sx = 0;
    let sy = 0;
    let sw = sourceWidth;
    let sh = sourceHeight;

    if (sourceRatio > targetRatio) {
      sw = sourceHeight * targetRatio;
      sx = (sourceWidth - sw) / 2;
    } else {
      sh = sourceWidth / targetRatio;
      sy = (sourceHeight - sh) / 2;
    }

    // Mirror the cropped webcam image.
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      video,
      sx, sy, sw, sh,
      0, 0, canvas.width, canvas.height
    );
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
