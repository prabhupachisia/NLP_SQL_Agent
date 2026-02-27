import { useState } from "react";

export default function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative bg-slate-900 text-green-400 rounded-lg p-6 text-sm overflow-x-auto">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 text-xs bg-slate-700 px-3 py-1 rounded hover:bg-slate-600 transition"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="whitespace-pre-wrap">{code}</pre>
    </div>
  );
}
