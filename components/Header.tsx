import React from 'react';
import { Terminal } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="inline-flex items-center bg-brand-surface p-3 rounded-full border border-brand-border">
        <Terminal className="h-8 w-8 text-brand-primary" />
      </div>
      <h1 className="mt-4 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary sm:text-5xl">
        RBAC Script Generator
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-text-secondary">
        Instantly generate secure, temporary access scripts for your infrastructure. Fill out the form below to get started.
      </p>
    </header>
  );
};

export default Header;