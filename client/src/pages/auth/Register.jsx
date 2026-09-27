import React from 'react';
import RegisterForm from '../../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto flex items-center justify-center min-h-[calc(100vh-220px)]">
      <RegisterForm />
    </div>
  );
}
