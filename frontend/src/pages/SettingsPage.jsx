import { useEffect, useState } from 'react';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import BottomNav from '../components/layout/BottomNav';
import PageWrapper from '../components/layout/PageWrapper';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useActivity } from '../hooks/useActivity';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { rule, ruleQuery, saveRule } = useActivity();
  const [thresholdDays, setThresholdDays] = useState(30);
  const [warningDays, setWarningDays] = useState(7);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [deleteText, setDeleteText] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (rule) {
      setThresholdDays(rule.thresholdDays);
      setWarningDays(rule.warningDays);
    }
  }, [rule]);

  async function handleSaveRule() {
    setMessage('');
    setError('');

    try {
      await saveRule.mutateAsync({ thresholdDays, warningDays });
      setMessage('Guardian Protocol saved successfully.');
    } catch (saveError) {
      setError(saveError.response?.data?.error || 'Failed to save rule.');
    }
  }

  async function handlePasswordChange(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirmation must match.');
      return;
    }

    setIsPasswordSaving(true);

    try {
      await api.auth.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );
      setMessage('Password changed successfully.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (passwordError) {
      setError(passwordError.response?.data?.error || 'Failed to change password.');
    } finally {
      setIsPasswordSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteText !== 'DELETE') {
      setError('Type DELETE to confirm account removal.');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      await api.auth.deleteAccount();
      logout();
    } catch (deleteError) {
      setError(deleteError.response?.data?.error || 'Failed to delete account.');
      setIsDeleting(false);
    }
  }

  return (
    <PageWrapper>
      <header className="mb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Adjust your guardian protocol and account safeguards.
        </p>
      </header>

      <section className="surface-card mb-4 p-5">
        <h2 className="text-lg font-semibold text-gray-900">Guardian Protocol</h2>
        {ruleQuery.isPending ? (
          <p className="mt-3 text-sm text-gray-500">Loading your rule...</p>
        ) : (
          <div className="mt-4 space-y-5">
            <div>
              <label className="field-label">
                Trigger inheritance after {thresholdDays} days of inactivity
              </label>
              <input
                type="range"
                min="7"
                max="365"
                value={thresholdDays}
                onChange={(event) => setThresholdDays(Number(event.target.value))}
                className="w-full accent-brand"
              />
            </div>

            <div>
              <label className="field-label">
                Warn me {warningDays} days before triggering
              </label>
              <input
                type="range"
                min="1"
                max="14"
                value={warningDays}
                onChange={(event) => setWarningDays(Number(event.target.value))}
                className="w-full accent-brand"
              />
            </div>

            <div className="rounded-xl bg-purple-50 p-4 text-sm text-gray-700">
              If you don't respond within {warningDays} days of our warning, your
              beneficiaries will receive access to your vault.
            </div>

            <button
              type="button"
              className="primary-button w-full"
              onClick={handleSaveRule}
              disabled={saveRule.isPending}
            >
              {saveRule.isPending ? 'Saving rule...' : 'Save Rule'}
            </button>
          </div>
        )}
      </section>

      <section className="surface-card mb-4 p-5">
        <h2 className="text-lg font-semibold text-gray-900">Account</h2>
        <div className="mt-4 grid gap-3">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">Name</p>
            <p className="mt-1 text-sm font-medium text-gray-800">{user?.name}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">Email</p>
            <p className="mt-1 text-sm font-medium text-gray-800">{user?.email}</p>
          </div>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handlePasswordChange}>
          <div>
            <label className="field-label" htmlFor="current-password">
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              className="field-input"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm({ ...passwordForm, currentPassword: event.target.value })
              }
            />
          </div>
          <div>
            <label className="field-label" htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              className="field-input"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm({ ...passwordForm, newPassword: event.target.value })
              }
            />
          </div>
          <div>
            <label className="field-label" htmlFor="confirm-password">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              className="field-input"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })
              }
            />
          </div>

          <button className="secondary-button w-full" disabled={isPasswordSaving} type="submit">
            {isPasswordSaving ? 'Updating password...' : 'Change Password'}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-red-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-red-50 p-2 text-danger">
            <WarningAmberRoundedIcon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-danger">Danger Zone</h2>
            <p className="mt-2 text-sm text-gray-600">
              Delete your account and all vault records. Type DELETE to confirm.
            </p>
            <input
              className="field-input mt-4"
              value={deleteText}
              onChange={(event) => setDeleteText(event.target.value)}
              placeholder="Type DELETE"
            />
            <button
              type="button"
              className="mt-4 w-full rounded-xl bg-danger px-4 py-3 text-sm font-semibold text-white"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting account...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </section>

      {message ? <p className="mt-4 text-sm text-teal-700">{message}</p> : null}
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}

      <BottomNav />
    </PageWrapper>
  );
}
