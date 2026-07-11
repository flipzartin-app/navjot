import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import api from '../services/api';
import CurriculumBuilder from '../components/CurriculumBuilder';

const emptyForm = { title: '', description: '', category: '', level: 'beginner', price: 0, discountPrice: 0, thumbnail: '' };

const InstructorPanel = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expandedCourseId, setExpandedCourseId] = useState(null);

  const load = () => api.get('/courses/instructor/mine').then((res) => setCourses(res.data));
  useEffect(() => { load(); }, []);

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const { data } = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm((f) => ({ ...f, thumbnail: data.imageUrl }));
      toast.success('Thumbnail uploaded');
    } catch {
      toast.error('Upload failed - check Cloudinary credentials');
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/courses', form);
      toast.success('Course created! It will appear publicly after admin approval.');
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const handlePublishToggle = async (course) => {
    try {
      await api.put(`/courses/${course._id}`, { isPublished: !course.isPublished });
      toast.success(course.isPublished ? 'Course unpublished' : 'Submitted for admin review');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update course');
    }
  };

  return (
    <>
      <Helmet><title>Instructor Panel - EduStream</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold mb-6">My Courses</h1>
          <div className="space-y-3">
            {courses.length === 0 && <p className="text-gray-500 text-sm">You haven't created any courses yet.</p>}
            {courses.map((c) => (
              <div key={c._id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-gray-500">
                      {c.category} &middot; ${c.price} &middot; {c.sections?.reduce((sum, s) => sum + s.lessons.length, 0) || 0} lessons
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-full ${c.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className={`px-2 py-1 rounded-full ${c.isApproved ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {c.isApproved ? 'Approved' : 'Pending Review'}
                    </span>
                    <button onClick={() => handlePublishToggle(c)} className="btn-secondary px-2 py-1">
                      {c.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => setExpandedCourseId(expandedCourseId === c._id ? null : c._id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {expandedCourseId === c._id ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                  </div>
                </div>

                {expandedCourseId === c._id && (
                  <>
                    {c.sections?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {c.sections.map((s, sIdx) => (
                          <div key={sIdx} className="text-sm border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                            <p className="font-medium">{s.title}</p>
                            <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
                              {s.lessons.map((l, lIdx) => <li key={lIdx}>&bull; {l.title}</li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                    <CurriculumBuilder course={c} onSaved={load} />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-bold mb-4">Create New Course</h2>
          <form onSubmit={handleCreate} className="card p-5 space-y-3">
            <input required placeholder="Course title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
            <textarea required placeholder="Description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
            <input required placeholder="Category (e.g. Web Development)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" />
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="input-field">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <div className="flex gap-2">
              <input required type="number" min="0" placeholder="Price ($)" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="input-field" />
              <input type="number" min="0" placeholder="Discount price" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Thumbnail</label>
              <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="text-sm" />
              {uploading && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
              {form.thumbnail && <img src={form.thumbnail} alt="thumbnail preview" className="mt-2 rounded-lg w-full aspect-video object-cover" />}
            </div>
            <button type="submit" disabled={creating} className="btn-primary w-full">
              {creating ? 'Creating...' : 'Create Course'}
            </button>
            <p className="text-xs text-gray-400">After creating, click the course below to expand it and add lessons.</p>
          </form>
        </div>
      </div>
    </>
  );
};

export default InstructorPanel;
