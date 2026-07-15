import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
<<<<<<< HEAD
import { FiStar, FiLock, FiPlayCircle, FiCheckCircle, FiHeart } from 'react-icons/fi';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../hooks/useWishlist';
import VideoPlayer from '../components/VideoPlayer';
import { formatViews } from '../services/formatViews';
=======
import { FiStar, FiLock, FiPlayCircle, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87

const CourseDetails = () => {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
<<<<<<< HEAD
  const { isAuthenticated, user } = useAuth();
  const { wishlistIds, toggle } = useWishlist();
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [previewLesson, setPreviewLesson] = useState(null);
=======
  const { isAuthenticated } = useAuth();
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87

  useEffect(() => {
    setLoading(true);
    api
<<<<<<< HEAD
      .get(`/courses/${slug}`)
      .then((res) => {
        setCourse(res.data);
        return api.get(`/reviews/${res.data._id}`);
=======
      .get(`/courses/₹{slug}`)
      .then((res) => {
        setCourse(res.data);
        return api.get(`/reviews/₹{res.data._id}`);
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87
      })
      .then((res) => setReviews(res.data))
      .catch(() => toast.error('Course not found'))
      .finally(() => setLoading(false));
  }, [slug]);

<<<<<<< HEAD
  const markPreviewView = async () => {
    if (!previewLesson?._id || !course) return;
    try {
      const { data } = await api.post(`/courses/${course._id}/lessons/${previewLesson._id}/view`);
      setPreviewLesson((prev) => (prev ? { ...prev, views: data.views } : prev));
    } catch {
      // silent - non-critical
    }
  };

  const handleSubmitReview = async () => {
    if (myRating === 0) {
      toast.error('Pick a star rating first');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/reviews/${course._id}`, { rating: myRating, comment: myComment });
      toast.success('Review submitted');
      const { data } = await api.get(`/reviews/${course._id}`);
      setReviews(data);
      const { data: updatedCourse } = await api.get(`/courses/${slug}`);
      setCourse(updatedCourse);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    if (!user || reviews.length === 0) return;
    const existing = reviews.find((r) => r.user?._id === user._id);
    if (existing) {
      setMyRating(existing.rating);
      setMyComment(existing.comment || '');
    }
  }, [reviews, user]);

=======
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87
  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!course) return <div className="text-center py-20">Course not found.</div>;

  const finalPrice = course.discountPrice > 0 ? course.discountPrice : course.price;
  const totalLessons = course.sections?.reduce((sum, s) => sum + s.lessons.length, 0) || 0;

  return (
    <>
      <Helmet>
        <title>{course.title} - EduStream</title>
        <meta name="description" content={course.description?.slice(0, 155)} />
      </Helmet>

      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <span className="text-primary-400 text-sm uppercase font-medium">{course.category}</span>
            <h1 className="text-2xl md:text-3xl font-bold mt-2">{course.title}</h1>
            <p className="text-gray-300 mt-3">{course.description}</p>
            <div className="flex items-center gap-3 mt-4 text-sm">
              <span className="flex items-center gap-1"><FiStar className="text-yellow-400 fill-yellow-400" /> {course.ratingAverage?.toFixed(1) || 'New'}</span>
              <span className="text-gray-400">({course.ratingCount} ratings)</span>
              <span className="text-gray-400">{course.studentsCount} students</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Instructor: <Link to="#" className="text-primary-400 hover:underline">{course.instructor?.name}</Link>
            </p>
          </div>

          <div className="card p-5 text-gray-900 dark:text-gray-100 h-fit">
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 overflow-hidden">
              {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />}
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold">₹{finalPrice}</span>
              {course.discountPrice > 0 && <span className="line-through text-gray-400">₹{course.price}</span>}
            </div>
            {course.isEnrolled ? (
<<<<<<< HEAD
              <Link to={`/watch/${course.slug}`} className="btn-primary w-full text-center block">Go to Course</Link>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button onClick={() => addToCart(course)} className="btn-primary flex-1">Add to Cart</button>
                  <button
                    onClick={() => toggle(course._id)}
                    className="p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
                    aria-label="Toggle wishlist"
                  >
                    <FiHeart className={wishlistIds.has(course._id) ? 'fill-red-500 text-red-500' : ''} />
                  </button>
                </div>
=======
              <Link to={`/watch/₹{course.slug}`} className="btn-primary w-full text-center block">Go to Course</Link>
            ) : (
              <div className="space-y-2">
                <button onClick={() => addToCart(course)} className="btn-primary w-full">Add to Cart</button>
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87
                <Link to="/cart" className="btn-secondary w-full text-center block">Buy Now</Link>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-3 text-center">{totalLessons} lessons &middot; Lifetime access &middot; Certificate on completion</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Course Content</h2>
          <div className="space-y-3">
            {course.sections?.map((section, sIdx) => (
              <div key={sIdx} className="card p-4">
                <h3 className="font-semibold mb-2">{section.title}</h3>
                <ul className="space-y-1">
<<<<<<< HEAD
                  {section.lessons.map((lesson, lIdx) => {
                    const isPlayable = lesson.isPreview && lesson.videoUrl;
                    return (
                      <li key={lIdx} className="border-t border-gray-100 dark:border-gray-800 first:border-t-0">
                        <button
                          disabled={!isPlayable}
                          onClick={() => isPlayable && setPreviewLesson(lesson)}
                          className={`w-full flex items-center justify-between text-sm py-1.5 text-left ${isPlayable ? 'hover:text-primary-600 cursor-pointer' : 'cursor-default'}`}
                        >
                          <span className="flex items-center gap-2">
                            {isPlayable ? <FiPlayCircle className="text-primary-600" /> : <FiLock className="text-gray-400" />}
                            {lesson.title}
                          </span>
                          <span className="flex items-center gap-2">
                            {isPlayable && <span className="text-xs text-gray-400">{formatViews(lesson.views)}</span>}
                            {lesson.isPreview && <span className="text-xs text-primary-600 font-medium">Preview</span>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
=======
                  {section.lessons.map((lesson, lIdx) => (
                    <li key={lIdx} className="flex items-center justify-between text-sm py-1.5 border-t border-gray-100 dark:border-gray-800 first:border-t-0">
                      <span className="flex items-center gap-2">
                        {lesson.videoUrl || lesson.isPreview ? <FiPlayCircle className="text-primary-600" /> : <FiLock className="text-gray-400" />}
                        {lesson.title}
                      </span>
                      {lesson.isPreview && <span className="text-xs text-primary-600 font-medium">Preview</span>}
                    </li>
                  ))}
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87
                </ul>
              </div>
            ))}
            {(!course.sections || course.sections.length === 0) && (
              <p className="text-gray-500 text-sm">Curriculum coming soon.</p>
            )}
          </div>

          <h2 className="text-xl font-bold mt-10 mb-4">Reviews ({reviews.length})</h2>
<<<<<<< HEAD

          {isAuthenticated ? (
            <div className="card p-4 mb-4">
              <p className="text-sm font-medium mb-2">
                {reviews.some((r) => r.user?._id === user?._id) ? 'Update your review' : 'Leave a review'}
              </p>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setMyRating(star)} aria-label={`${star} stars`}>
                    <FiStar className={star <= myRating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'} size={22} />
                  </button>
                ))}
              </div>
              <textarea
                placeholder="What did you think of this course? (optional)"
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                rows={3}
                className="input-field mb-3"
              />
              <button onClick={handleSubmitReview} disabled={submittingReview} className="btn-primary text-sm">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mb-4">
              <Link to="/login" className="text-primary-600 font-medium">Log in</Link> to leave a review.
            </p>
          )}

=======
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87
          <div className="space-y-4">
            {reviews.length === 0 && <p className="text-gray-500 text-sm">No reviews yet.</p>}
            {reviews.map((r) => (
              <div key={r._id} className="card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.user?.name}</span>
                  <span className="flex items-center gap-1 text-sm"><FiStar className="text-yellow-500 fill-yellow-500" /> {r.rating}</span>
                </div>
                {r.comment && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card p-5">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><FiCheckCircle className="text-primary-600" /> What you'll need</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">A computer and enthusiasm to learn. No prior experience required for beginner courses.</p>
          </div>
        </div>
      </div>
<<<<<<< HEAD

      {previewLesson && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewLesson(null)}
        >
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2 text-white">
              <p className="font-medium">
                {previewLesson.title} <span className="text-xs text-primary-400 ml-1">Free Preview</span>
                <span className="text-xs text-gray-400 ml-2">{formatViews(previewLesson.views)}</span>
              </p>
              <button onClick={() => setPreviewLesson(null)} className="text-sm hover:text-gray-300">Close ✕</button>
            </div>
            <VideoPlayer src={previewLesson.videoUrl} onPlay={markPreviewView} />
          </div>
        </div>
      )}
=======
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87
    </>
  );
};

export default CourseDetails;
