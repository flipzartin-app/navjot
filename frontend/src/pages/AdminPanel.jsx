import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import api from '../services/api';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [tab, setTab] = useState('overview');

  const loadAll = () => {
    api.get('/admin/stats').then((res) => setStats(res.data));
    api.get('/admin/users').then((res) => setUsers(res.data));
    api.get('/admin/courses/pending').then((res) => setPendingCourses(res.data));
  };

  useEffect(() => { loadAll(); }, []);

  const handleBan = async (id) => {
    await api.put(`/admin/users/${id}/ban`);
    toast.success('User status updated');
    loadAll();
  };

  const handleApprove = async (id) => {
    await api.put(`/admin/courses/${id}/approve`);
    toast.success('Course approved and now live');
    loadAll();
  };

  return (
    <>
      <Helmet><title>Admin Panel - EduStream</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-5"><p className="text-2xl font-bold">{stats?.userCount ?? '-'}</p><p className="text-sm text-gray-500">Students</p></div>
          <div className="card p-5"><p className="text-2xl font-bold">{stats?.instructorCount ?? '-'}</p><p className="text-sm text-gray-500">Instructors</p></div>
          <div className="card p-5"><p className="text-2xl font-bold">{stats?.courseCount ?? '-'}</p><p className="text-sm text-gray-500">Total Courses</p></div>
          <div className="card p-5"><p className="text-2xl font-bold">${stats?.totalRevenue?.toFixed(2) ?? '0.00'}</p><p className="text-sm text-gray-500">Revenue</p></div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800">
          {['overview', 'users', 'courses'].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium capitalize ${tab === t ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <p className="text-gray-500 text-sm">{stats?.pendingApprovalCount || 0} course(s) awaiting your review.</p>
        )}

        {tab === 'users' && (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u._id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{u.name} <span className="text-xs text-gray-400">({u.role})</span></p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <button onClick={() => handleBan(u._id)} className={`text-xs font-medium px-3 py-1.5 rounded-lg ${u.isBanned ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {u.isBanned ? 'Unban' : 'Ban'}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'courses' && (
          <div className="space-y-2">
            {pendingCourses.length === 0 && <p className="text-gray-500 text-sm">No courses pending approval.</p>}
            {pendingCourses.map((c) => (
              <div key={c._id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-xs text-gray-500">by {c.instructor?.name} &middot; {c.category}</p>
                </div>
                <button onClick={() => handleApprove(c._id)} className="btn-primary text-xs px-3 py-1.5">Approve</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPanel;
