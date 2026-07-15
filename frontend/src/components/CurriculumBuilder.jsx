import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';

const emptyLesson = { title: '', videoUrl: '', isPreview: false, uploading: false };

// Lets an instructor build one section (a group of lessons) at a time for a given course.
// Each lesson's video is uploaded to Cloudinary immediately on file select; the section
// (with all its lessons + final video URLs) is only sent to the backend on "Save Section".
const CurriculumBuilder = ({ course, onSaved }) => {
  const [sectionTitle, setSectionTitle] = useState('');
  const [lessons, setLessons] = useState([{ ...emptyLesson }]);
  const [saving, setSaving] = useState(false);

  const updateLesson = (idx, patch) => {
    setLessons((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const addLessonRow = () => setLessons((prev) => [...prev, { ...emptyLesson }]);

  const removeLessonRow = (idx) => setLessons((prev) => prev.filter((_, i) => i !== idx));

  const handleVideoUpload = async (idx, file) => {
    if (!file) return;
    updateLesson(idx, { uploading: true });
    const fd = new FormData();
    fd.append('video', file);
    try {
      const { data } = await api.post('/upload/video', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateLesson(idx, { videoUrl: data.videoUrl, duration: data.duration, uploading: false });
      toast.success('Video uploaded');
    } catch (err) {
      updateLesson(idx, { uploading: false });
      toast.error(err.response?.data?.message || 'Video upload failed - check Cloudinary credentials in backend .env');
    }
  };

  const handleSaveSection = async () => {
    if (!sectionTitle.trim()) {
      toast.error('Give this section a title');
      return;
    }
    const readyLessons = lessons.filter((l) => l.title.trim() && l.videoUrl);
    if (readyLessons.length === 0) {
      toast.error('Add at least one lesson with a title and an uploaded video');
      return;
    }
    setSaving(true);
    try {
      await api.post(`/courses/${course._id}/sections`, {
        title: sectionTitle,
        lessons: readyLessons.map(({ title, videoUrl, isPreview, duration }) => ({
          title,
          videoUrl,
          isPreview,
          duration: duration || 0,
        })),
      });
      toast.success('Section added to course');
      setSectionTitle('');
      setLessons([{ ...emptyLesson }]);
      onSaved?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-4 mt-3 space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1">Section title</label>
        <input
          placeholder="e.g. Getting Started"
          value={sectionTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="space-y-3">
        {lessons.map((lesson, idx) => (
          <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                placeholder={`Lesson ${idx + 1} title`}
                value={lesson.title}
                onChange={(e) => updateLesson(idx, { title: e.target.value })}
                className="input-field flex-1"
              />
              {lessons.length > 1 && (
                <button onClick={() => removeLessonRow(idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shrink-0">
                  <FiTrash2 />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-primary-600">
                <FiUploadCloud />
                <span>{lesson.uploading ? 'Uploading...' : lesson.videoUrl ? 'Replace video' : 'Upload video'}</span>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleVideoUpload(idx, e.target.files[0])}
                  disabled={lesson.uploading}
                />
              </label>
              {lesson.videoUrl && (
                <span className="flex items-center gap-1 text-green-600 text-xs">
                  <FiCheckCircle /> Uploaded
                </span>
              )}
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-500">
              <input
                type="checkbox"
                checked={lesson.isPreview}
                onChange={(e) => updateLesson(idx, { isPreview: e.target.checked })}
              />
              Free preview (visible to non-enrolled visitors)
            </label>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={addLessonRow} className="btn-secondary text-sm">+ Add another lesson</button>
        <button onClick={handleSaveSection} disabled={saving} className="btn-primary text-sm ml-auto">
          {saving ? 'Saving...' : 'Save Section'}
        </button>
      </div>
    </div>
  );
};

export default CurriculumBuilder;
