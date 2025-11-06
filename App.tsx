import React, { useState, useCallback } from 'react';
import { GeneratorFormData } from './types';
import { generateScript } from './services/geminiService';
import Header from './components/Header';
import GeneratorForm from './components/GeneratorForm';
import ScriptOutput from './components/ScriptOutput';
import { Loader2 } from 'lucide-react';
import { useApiKey } from './context/ApiKeyContext';
import ApiKeyInputPage from './components/ApiKeyInputPage';

const App: React.FC = () => {
  const { apiKey, setApiKey } = useApiKey();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateScript = useCallback(async (formData: GeneratorFormData) => {
    if (!apiKey) {
      setError("API Key is not set. Please set your API key.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedScript('');
    try {
      const script = await generateScript(formData, apiKey);
      setGeneratedScript(script);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      // Check for common API key errors
      if (errorMessage.toLowerCase().includes('api key not valid')) {
          setError(`API Key is not valid. Please check your key and try again.`);
          setApiKey(null); // Clear the invalid key
      } else {
          setError(`Failed to generate script: ${errorMessage}`);
      }
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, setApiKey]);

  if (!apiKey) {
    return <ApiKeyInputPage />;
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text-primary font-sans">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GeneratorForm onGenerate={handleGenerateScript} isLoading={isLoading} />
          <div className="flex flex-col">
            {isLoading && (
              <div className="flex-grow flex items-center justify-center bg-brand-surface rounded-lg p-6">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-brand-primary animate-spin mx-auto" />
                  <p className="mt-4 text-brand-text-secondary">Generating script... this may take a moment.</p>
                </div>
              </div>
            )}
            {error && (
              <div className="flex-grow flex items-center justify-center bg-red-100 border border-red-200 rounded-lg p-6">
                 <p className="text-red-800">{error}</p>
              </div>
            )}
            {!isLoading && !error && (
              <ScriptOutput script={generatedScript} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;