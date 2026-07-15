import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, setUser } = useAuth();
  const hasPassword = !!user?.hasPassword; // see note below on why this comes from context, not user object directly

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/users/profile', { name, bio });
      setUser((prev) => ({ ...prev, ...data }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/users/profile', { currentPassword, password: newPassword });
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <Helmet><title>Settings - EduStream</title></Helmet>
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-2xl font-bold">Settings</h1>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">Profile</h2>
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Email</label>
              <input value={user?.email || ''} disabled className="input-field opacity-60 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email can't be changed here.</p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="input-field" />
            </div>
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-1">{hasPassword ? 'Change Password' : 'Set a Password'}</h2>
          <p className="text-xs text-gray-400 mb-4">
            {hasPassword
              ? "You'll need your current password to set a new one."
              : "Your account was created with Google Sign-In and has no password yet. Set one if you'd also like to log in with an email/password."}
          </p>
          <form onSubmit={handleChangePassword} className="space-y-3">
            {hasPassword && (
              <div>
                <label className="text-sm font-medium block mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium block mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
              />
            </div>
            <button type="submit" disabled={savingPassword} className="btn-primary">
              {savingPassword ? 'Saving...' : hasPassword ? 'Update Password' : 'Set Password'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Settings;
