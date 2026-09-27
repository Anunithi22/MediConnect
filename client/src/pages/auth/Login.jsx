import React from 'react';
import LoginForm from '../../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto flex items-center justify-center min-h-[calc(100vh-220px)]">
      <LoginForm />
    </div>
  );
}
