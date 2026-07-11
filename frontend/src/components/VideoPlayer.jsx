import { useRef } from 'react';

// Simple HTML5 video player wired to Cloudinary-hosted MP4s.
// onProgress fires once the video is watched to >= 90% (used to mark lesson complete).
const VideoPlayer = ({ src, onComplete }) => {
  const videoRef = useRef(null);
  const firedRef = useRef(false);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || firedRef.current) return;
    if (video.currentTime / video.duration >= 0.9) {
      firedRef.current = true;
      onComplete?.();
    }
  };

  if (!src) {
    return (
      <div className="aspect-video bg-black flex items-center justify-center text-white rounded-xl">
        <p>This lesson is locked. Enroll to watch.</p>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      controlsList="nodownload"
      className="w-full aspect-video bg-black rounded-xl"
      onTimeUpdate={handleTimeUpdate}
    />
  );
};

export default VideoPlayer;
