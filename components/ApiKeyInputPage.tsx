import React, { useState } from 'react';
import { useApiKey } from '../context/ApiKeyContext';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { KeyRound } from 'lucide-react';

const ApiKeyInputPage: React.FC = () => {
  const [localApiKey, setLocalApiKey] = useState('');
  const { setApiKey } = useApiKey();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localApiKey.trim()) {
      setApiKey(localApiKey.trim());
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
            <div className="inline-flex items-center bg-brand-surface p-3 rounded-full border border-brand-border">
                <KeyRound className="h-8 w-8 text-brand-primary" />
            </div>
            <h1 className="mt-4 text-3xl font-extrabold text-brand-text-primary">
                Enter Your Gemini API Key
            </h1>
            <p className="mt-2 text-brand-text-secondary">
                To use the RBAC Script Generator, please provide your Google Gemini API key.
                Your key will be stored securely in your browser's local storage.
            </p>
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Gemini API Key"
              id="apiKey"
              name="apiKey"
              type="password"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="Enter your API key here"
              required
            />
            <Button type="submit" className="w-full">
              Save and Continue
            </Button>
          </form>
        </Card>
         <div className="text-center mt-4">
            <a 
              href="https://ai.google.dev/gemini-api/docs/api-key" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-brand-primary hover:underline"
            >
              How to get an API key
            </a>
          </div>
      </div>
    </div>
  );
};

export default ApiKeyInputPage;
