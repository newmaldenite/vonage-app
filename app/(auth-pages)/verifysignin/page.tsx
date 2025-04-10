'use client';

import { Suspense } from 'react';
import { verify2FAAction } from '@/lib/auth/verify2FA';
import { useSearchParams } from 'next/navigation';

// Wrap the main component in Suspense
export default function VerifySignInPage() {
  return (
    <div className="verification-page">
      <h1>Two-Factor Verification</h1>
      <Suspense fallback={<div>Loading verification...</div>}>
        <VerificationForm />
      </Suspense>
    </div>
  );
}

// Separate component for the form with search params
function VerificationForm() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const type = searchParams.get('type');

  return (
    <>
      {message && (
        <div className={`alert ${type === 'error' ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      <form action={verify2FAAction}>
        <input
          type="text"
          name="code"
          placeholder="Enter verification code"
          required
        />
        <button type="submit">Verify Code</button>
      </form>
    </>
  );
}