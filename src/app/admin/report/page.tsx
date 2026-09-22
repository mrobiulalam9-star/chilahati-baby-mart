"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type ReportResult = {
  filePath: string;
  filename: string;
  source: "excel" | "pdf";
  rows: number;
  columns: number;
  pages: number;
};

export default function ReportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [result, setResult] = useState<ReportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/auth/check")
      .then((res) => {
        if (!res.ok) router.push("/admin");
      })
      .catch(() => {});
  }, [router]);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 6000);
  };

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] || null;
    setFile(picked);
    setResult(null);
    setMessage(null);
  };

  const handleGenerate = async () => {
    if (!file || generating) return;

    setGenerating(true);
    setMessage(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/report", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setResult(data as ReportResult);
        showMessage("Report generated and saved!", "success");
      } else {
        showMessage(data.error || "Failed to generate report", "error");
      }
    } catch {
      showMessage("Network error while generating report", "error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-white border-b border-line sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="w-9 h-9 rounded-full object-cover" />
            <div>
              <h1 className="font-display font-bold text-lg leading-none">Report Studio</h1>
              <p className="text-xs text-muted">Create a report</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/dashboard"
              className="px-4 py-2 text-sm font-medium border border-line rounded-xl hover:border-blush transition-colors"
            >
              ← Back to Dashboard
            </a>
            <a
              href="/admin/report?download=1"
              onClick={(e) => {
                if (result) return;
                e.preventDefault();
                showMessage("Generate a report first to download it", "error");
              }}
              className="px-4 py-2 text-sm font-medium border border-line rounded-xl hover:border-blush transition-colors"
            >
              Download PDF
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-line p-6 md:p-8">
          <h2 className="font-display font-bold text-2xl mb-2">Generate Report</h2>
          <p className="text-muted text-sm mb-6">
            Upload an Excel spreadsheet or a PDF file. A formatted report will be generated and saved
            to your Desktop as <span className="font-mono text-ink">report.pdf</span>.
          </p>

          <div className="flex items-center gap-4">
            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-line hover:border-blush transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
              {file ? "Choose Another File" : "Choose File"}
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.tsv,.pdf"
                onChange={handlePick}
                className="hidden"
              />
            </label>
            <span className="text-xs text-muted">Excel (.xlsx, .xls, .csv) or PDF · max 20MB</span>
          </div>

          {file && (
            <div className="mt-4 flex items-center justify-between gap-4 p-4 rounded-2xl bg-cream/50 border border-line">
              <div className="flex items-center gap-3 min-w-0">
                <svg className="shrink-0 text-blush" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{file.name}</p>
                  <p className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="shrink-0 p-2 rounded-xl text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Remove file"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!file || generating}
            className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blush hover:bg-blush-deep disabled:opacity-40 text-white font-semibold transition-colors disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating report...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Generate Report
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-3xl p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-xl text-green-800 mb-1">Report ready!</h3>
                <p className="text-sm text-green-700 break-all">{result.filePath}</p>
              </div>
              <span className="shrink-0 text-2xl">✅</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
              <div className="bg-white rounded-2xl border border-green-200 p-4 text-center">
                <p className="font-display font-bold text-2xl text-green-800">
                  {result.source === "excel" ? result.rows : "—"}
                </p>
                <p className="text-xs uppercase tracking-widest text-green-700/70">Rows</p>
              </div>
              <div className="bg-white rounded-2xl border border-green-200 p-4 text-center">
                <p className="font-display font-bold text-2xl text-green-800">
                  {result.source === "excel" ? result.columns : "—"}
                </p>
                <p className="text-xs uppercase tracking-widest text-green-700/70">Columns</p>
              </div>
              <div className="bg-white rounded-2xl border border-green-200 p-4 text-center">
                <p className="font-display font-bold text-2xl text-green-800">{result.pages}</p>
                <p className="text-xs uppercase tracking-widest text-green-700/70">Pages</p>
              </div>
              <div className="bg-white rounded-2xl border border-green-200 p-4 text-center">
                <p className="font-display font-bold text-2xl text-green-800 capitalize">{result.source}</p>
                <p className="text-xs uppercase tracking-widest text-green-700/70">Source</p>
              </div>
            </div>

            <div className="mt-5">
              <a
                href="/api/admin/report"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download report.pdf
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}