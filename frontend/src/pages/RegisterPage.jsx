import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(form.name, form.email, form.password);
    } catch (submitError) {
      setError(submitError.response?.data?.error || 'Registration failed.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-card">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">WAULT</p>
          <h1 className="mt-3 text-2xl font-semibold text-gray-900">Create your vault</h1>
          <p className="mt-2 text-sm text-gray-500">
            Start your guardian protocol in a few minutes.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="field-label" htmlFor="register-name">
              Name
            </label>
            <input
              id="register-name"
              className="field-input"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="register-email">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              className="field-input"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              className="field-input"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="At least 8 characters"
            />
          </div>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <button className="primary-button w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link className="font-semibold text-brand" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
