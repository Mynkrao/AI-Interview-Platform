// pages/RegisterPage.jsx
// Route: /register (Public). SRS Table 14: "Name, email, password fields.
// Link to login." FR-01-01 / FR-01-02.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as authAPI from '../api/authAPI';
import useAuth from '../hooks/useAuth';

function validate({ name, email, password }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Name is required';
  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'Enter a valid email address';
  }
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters'; // FR-01-02
  }
  return errors;
}

function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const { data } = await authAPI.register(form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">Create your account</h1>

        {serverError && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {serverError}
          </p>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          className="w-full mb-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {fieldErrors.name && <p className="text-xs text-red-600 mb-3">{fieldErrors.name}</p>}

        <label className="block text-sm font-medium text-gray-700 mb-1 mt-3" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {fieldErrors.email && <p className="text-xs text-red-600 mb-3">{fieldErrors.email}</p>}

        <label className="block text-sm font-medium text-gray-700 mb-1 mt-3" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {fieldErrors.password && <p className="text-xs text-red-600 mb-3">{fieldErrors.password}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </button>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
