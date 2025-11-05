
import React, { useState, useEffect } from 'react';
import { Clipboard, Check } from 'lucide-react';

interface ScriptOutputProps {
  script: string;
}

const ScriptOutput: React.FC<ScriptOutputProps> = ({ script }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    if (script) {
      navigator.clipboard.writeText(script);
      setCopied(true);
    }
  };
  
  const placeholderText = `// Your generated script will appear here...
# 1. Fill out the form on the left.
# 2. Click "Generate Script".
# 3. The executable script will be displayed in this panel.
# 4. Click the copy button to save it to your clipboard.`;


  return (
    <div className="bg-brand-gray-900 rounded-lg h-full flex flex-col">
       <div className="flex justify-between items-center p-4 bg-brand-gray-800 rounded-t-lg border-b border-brand-gray-700">
            <h3 className="font-mono text-sm text-brand-gray-300">Generated Script</h3>
            <button
                onClick={handleCopy}
                disabled={!script}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md text-brand-gray-200 bg-brand-gray-700 hover:bg-brand-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {copied ? <Check size={14} className="text-green-400"/> : <Clipboard size={14} />}
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
      <pre className="flex-grow p-4 text-sm text-brand-gray-200 overflow-auto">
        <code className="language-shell">
            {script || placeholderText}
        </code>
      </pre>
    </div>
  );
};

export default ScriptOutput;
