'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Suspense } from 'react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Reset token is missing');
      router.push('/forgot-password');
    }
  }, [token, router]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post('/api/reset-password', { token, password });
      toast.success('Password reset successful');
      router.push('/login');
    } catch {
      toast.error('Password reset failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) return null;

  return (
    <form onSubmit={handleSubmit} className="max-w-xs mx-auto mt-8">
      <h1 className="text-center text-4xl mb-4">Reset Password</h1>
      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        required
        className="w-full p-2 mb-4 border rounded"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white p-2 rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}