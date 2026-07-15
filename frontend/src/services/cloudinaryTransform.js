// Cloudinary video URLs look like:
//   https://res.cloudinary.com/<cloud>/video/upload/v169.../elearning/videos/xyz.mp4
// Inserting a transformation string right after "/upload/" tells Cloudinary to transcode
// on the fly - this doesn't require re-uploading anything, it's applied per-request.

// Adds q_auto (smallest file that looks good) and f_auto (best format for the visitor's browser,
// e.g. serves a smaller-than-mp4 format to browsers that support one).
export const getOptimizedVideoUrl = (url) => {
  if (!url || !url.includes('/upload/')) return url;
  return url.replace('/upload/', '/upload/q_auto,f_auto/');
};

// Generates a poster image (first frame) from the same Cloudinary video, so the player shows
// something instantly instead of a blank box while the video itself loads.
export const getVideoPosterUrl = (url) => {
  if (!url || !url.includes('/upload/')) return '';
  return url
    .replace('/upload/', '/upload/so_0,q_auto,f_auto/')
    .replace(/\.(mp4|mov|webm|mkv)$/i, '.jpg');
};
