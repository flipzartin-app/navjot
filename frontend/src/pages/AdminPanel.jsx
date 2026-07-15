import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import api from '../services/api';

const emptyCouponForm = { code: '', discountType: 'percentage', discountValue: '', maxUses: '', minPurchaseAmount: '', expiresAt: '' };

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [couponForm, setCouponForm] = useState(emptyCouponForm);
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  const [tab, setTab] = useState('overview');

  const loadAll = () => {
    api.get('/admin/stats').then((res) => setStats(res.data));
    api.get('/admin/users').then((res) => setUsers(res.data));
    api.get('/admin/courses/pending').then((res) => setPendingCourses(res.data));
    api.get('/admin/coupons').then((res) => setCoupons(res.data));
  };

  useEffect(() => { loadAll(); }, []);

  const handleBan = async (id) => {
    await api.put(`/admin/users/${id}/ban`);
    toast.success('User status updated');
    loadAll();
  };

  const [resetPasswordUserId, setResetPasswordUserId] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  const handleResetPassword = async (userId) => {
    if (!newPasswordInput || newPasswordInput.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setResettingPassword(true);
    try {
      await api.put(`/admin/users/${userId}/reset-password`, { newPassword: newPasswordInput });
      toast.success('Password reset - now tell the user their new password directly');
      setResetPasswordUserId(null);
      setNewPasswordInput('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  };

  const handleApprove = async (id) => {
    await api.put(`/admin/courses/${id}/approve`);
    toast.success('Course approved and now live');
    loadAll();
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code.trim() || !couponForm.discountValue) {
      toast.error('Code and discount value are required');
      return;
    }
    setCreatingCoupon(true);
    try {
      await api.post('/admin/coupons', {
        code: couponForm.code,
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        maxUses: couponForm.maxUses ? Number(couponForm.maxUses) : null,
        minPurchaseAmount: couponForm.minPurchaseAmount ? Number(couponForm.minPurchaseAmount) : 0,
        expiresAt: couponForm.expiresAt || null,
      });
      toast.success('Coupon created');
      setCouponForm(emptyCouponForm);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleToggleCoupon = async (id) => {
    await api.put(`/admin/coupons/${id}/toggle`);
    toast.success('Coupon status updated');
    loadAll();
  };

  const handleDeleteCoupon = async (id) => {
    await api.delete(`/admin/coupons/${id}`);
    toast.success('Coupon deleted');
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
          <div className="card p-5"><p className="text-2xl font-bold">₹{stats?.totalRevenue?.toFixed(2) ?? '0.00'}</p><p className="text-sm text-gray-500">Revenue</p></div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800">
          {['overview', 'users', 'courses', 'coupons'].map((t) => (
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
              <div key={u._id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{u.name} <span className="text-xs text-gray-400">({u.role})</span></p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setResetPasswordUserId(resetPasswordUserId === u._id ? null : u._id);
                        setNewPasswordInput('');
                      }}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      Reset Password
                    </button>
                    <button onClick={() => handleBan(u._id)} className={`text-xs font-medium px-3 py-1.5 rounded-lg ${u.isBanned ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isBanned ? 'Unban' : 'Ban'}
                    </button>
                  </div>
                </div>

                {resetPasswordUserId === u._id && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                    <input
                      type="text"
                      placeholder="New password (min 6 characters)"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="input-field flex-1"
                    />
                    <button
                      onClick={() => handleResetPassword(u._id)}
                      disabled={resettingPassword}
                      className="btn-primary shrink-0"
                    >
                      {resettingPassword ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
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

        {tab === 'coupons' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              {coupons.length === 0 && <p className="text-gray-500 text-sm">No coupons created yet.</p>}
              {coupons.map((c) => (
                <div key={c._id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium font-mono">{c.code}</p>
                    <p className="text-xs text-gray-500">
                      {c.discountType === 'percentage' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                      {c.minPurchaseAmount > 0 && ` · min ₹${c.minPurchaseAmount}`}
                      {' · '}{c.usedCount} used{c.maxUses ? ` / ${c.maxUses}` : ''}
                      {c.expiresAt && ` · expires ${new Date(c.expiresAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs shrink-0">
                    <button
                      onClick={() => handleToggleCoupon(c._id)}
                      className={`px-2 py-1 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button onClick={() => handleDeleteCoupon(c._id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="font-bold mb-4">Create Coupon</h2>
              <form onSubmit={handleCreateCoupon} className="card p-5 space-y-3">
                <input
                  required
                  placeholder="Coupon code (e.g. WELCOME50)"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="input-field font-mono"
                />
                <select
                  value={couponForm.discountType}
                  onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                  className="input-field"
                >
                  <option value="percentage">Percentage off</option>
                  <option value="fixed">Fixed ₹ amount off</option>
                </select>
                <input
                  required
                  type="number"
                  min="1"
                  placeholder={couponForm.discountType === 'percentage' ? 'Discount % (1-100)' : 'Discount amount (₹)'}
                  value={couponForm.discountValue}
                  onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                  className="input-field"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Max uses (blank = unlimited)"
                  value={couponForm.maxUses}
                  onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                  className="input-field"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Minimum cart total (₹, optional)"
                  value={couponForm.minPurchaseAmount}
                  onChange={(e) => setCouponForm({ ...couponForm, minPurchaseAmount: e.target.value })}
                  className="input-field"
                />
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Expiry date (optional)</label>
                  <input
                    type="date"
                    value={couponForm.expiresAt}
                    onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                    className="input-field"
                  />
                </div>
                <button type="submit" disabled={creatingCoupon} className="btn-primary w-full">
                  {creatingCoupon ? 'Creating...' : 'Create Coupon'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPanel;
