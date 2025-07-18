'use client';

import React, { useState, Suspense } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

// The main form component that uses useSearchParams
const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch('/api/reset-password', { email, password });
      if (response.data.message) {
        setMessage('✅ Password reset successfully!');
      } else {
        setMessage(response.data.error || '❌ Failed to reset password.');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || '❌ Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return <p className="text-red-500 text-center">Email is missing in the query parameters.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Password Input */}
      <div className="relative">
        <label htmlFor="password" className="block text-sm font-medium text-gray-600">
          New Password
        </label>
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter your new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="absolute top-1/2 mt-2 right-3 transform -translate-y-1/2 flex items-center text-gray-500"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Confirm Password Input */}
      <div className="relative">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="absolute top-1/2 mt-2 right-3 transform -translate-y-1/2 flex items-center text-gray-500"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded-lg text-white ${
          loading
            ? 'bg-indigo-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 focus:ring focus:ring-indigo-300'
        } shadow-md font-semibold`}
      >
        {loading ? 'Resetting Password...' : 'Reset Password'}
      </button>

      {/* Feedback Message */}
      {message && (
        <div
          className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium ${
            message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
};

// The page component that wraps the form in Suspense
const ResetPasswordPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">🔒 Reset Password</h2>
        <Suspense fallback={<div>Loading password reset form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
};

export default ResetPasswordPage;