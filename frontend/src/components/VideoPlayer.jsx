import { useRef } from 'react';
import { getOptimizedVideoUrl, getVideoPosterUrl } from '../services/cloudinaryTransform';

// Simple HTML5 video player wired to Cloudinary-hosted videos.
// onProgress fires once the video is watched to >= 90% (used to mark lesson complete).
const VideoPlayer = ({ src, onComplete, onPlay }) => {
  const videoRef = useRef(null);
  const firedRef = useRef(false);
  const playFiredRef = useRef(false);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || firedRef.current) return;
    if (video.currentTime / video.duration >= 0.9) {
      firedRef.current = true;
      onComplete?.();
    }
  };

  const handlePlay = () => {
    if (playFiredRef.current) return;
    playFiredRef.current = true;
    onPlay?.();
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
      src={getOptimizedVideoUrl(src)}
      poster={getVideoPosterUrl(src)}
      preload="metadata"
      controls
      controlsList="nodownload noremoteplayback"
      disablePictureInPicture
      onContextMenu={(e) => e.preventDefault()}
      className="w-full aspect-video bg-black rounded-xl"
      onTimeUpdate={handleTimeUpdate}
      onPlay={handlePlay}
    />
  );
};

export default VideoPlayer;
