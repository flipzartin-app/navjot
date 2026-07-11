import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiCircle, FiAward } from 'react-icons/fi';
import api from '../services/api';
import VideoPlayer from '../components/VideoPlayer';

const WatchVideo = () => {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({ completedLessons: [], percentComplete: 0 });
  const [activeLesson, setActiveLesson] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/courses/${slug}`)
      .then((res) => {
        setCourse(res.data);
        const firstLesson = res.data.sections?.[0]?.lessons?.[0];
        setActiveLesson(firstLesson || null);
        return api.get(`/progress/${res.data._id}`);
      })
      .then((res) => setProgress(res.data))
      .catch(() => toast.error('Unable to load course'))
      .finally(() => setLoading(false));
  }, [slug]);

  const markComplete = async () => {
    if (!activeLesson?._id || !course) return;
    try {
      const { data } = await api.post(`/progress/${course._id}/lesson/${activeLesson._id}`);
      setProgress(data);
    } catch {
      // silent - non-critical
    }
  };

  const claimCertificate = async () => {
    try {
      const { data } = await api.post(`/certificates/${course._id}`);
      setCertificate(data);
      toast.success('Certificate issued!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Not eligible yet');
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!course) return <div className="text-center py-20">Course not found.</div>;
  if (!course.isEnrolled) return <div className="text-center py-20">You are not enrolled in this course.</div>;

  return (
    <>
      <Helmet><title>Watch: {course.title} - EduStream</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <VideoPlayer src={activeLesson?.videoUrl} onComplete={markComplete} />
          <h1 className="text-xl font-bold">{activeLesson?.title || course.title}</h1>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Your progress</span>
              <span className="text-sm text-primary-600 font-semibold">{progress.percentComplete}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${progress.percentComplete}%` }} />
            </div>
            {progress.percentComplete >= 100 && (
              <button onClick={claimCertificate} className="btn-primary mt-4 flex items-center gap-2">
                <FiAward /> {certificate ? `Certificate: ${certificate.certificateId}` : 'Claim Certificate'}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-bold">Course Content</h2>
          {course.sections?.map((section, sIdx) => (
            <div key={sIdx} className="card p-3">
              <h3 className="font-medium text-sm mb-2">{section.title}</h3>
              <ul className="space-y-1">
                {section.lessons.map((lesson, lIdx) => {
                  const isDone = progress.completedLessons?.includes(lesson._id);
                  const isActive = activeLesson?._id === lesson._id;
                  const isLocked = !lesson.videoUrl && !lesson.isPreview;
                  return (
                    <li key={lIdx}>
                      <button
                        disabled={isLocked}
                        onClick={() => setActiveLesson(lesson)}
                        className={`w-full flex items-center gap-2 text-left text-sm px-2 py-1.5 rounded-lg ${isActive ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'} disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {isDone ? <FiCheckCircle className="text-green-500 shrink-0" /> : <FiCircle className="text-gray-400 shrink-0" />}
                        {lesson.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default WatchVideo;
