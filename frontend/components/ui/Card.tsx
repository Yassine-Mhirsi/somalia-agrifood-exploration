"use client";

import { ReactNode, useRef, useState } from "react";
import { toPng } from "html-to-image";
import AIAnalysisModal from "./AIAnalysisModal";

interface CardProps {
  title: string;
  children: ReactNode;
  className?: string;
  chartType?: string;
  enableAIAnalysis?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Card({
  title,
  children,
  className = "",
  chartType,
  enableAIAnalysis = false,
}: CardProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [analysisText, setAnalysisText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setModalOpen(false);
  };

  const handleAnalyze = async () => {
    if (!contentRef.current || loading) {
      return;
    }

    setError(null);
    setAnalysisText("");
    setModalOpen(true);
    setLoading(true);

    try {
      const computedBackground = window.getComputedStyle(contentRef.current)
        .backgroundColor;
      const dataUrl = await toPng(contentRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor:
          computedBackground && computedBackground !== "rgba(0, 0, 0, 0)"
            ? computedBackground
            : "#ffffff",
      });

      const controller = new AbortController();
      abortRef.current = controller;

      const response = await fetch(`${API_URL}/api/analyze-visualization`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: dataUrl,
          title,
          chartType: chartType ?? "chart",
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Failed to analyze visualization (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        setAnalysisText((prev) => prev + chunk);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to analyze visualization"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden ${className}`}
    >
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
        {enableAIAnalysis && (
          <button
            type="button"
            onClick={handleAnalyze}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={`Analyze ${title} with AI`}
          >
            <img
              src="/noto-v1--sparkles.svg"
              alt=""
              className="h-4 w-4"
            />
            Analyze with AI
          </button>
        )}
      </div>
      <div ref={contentRef} className="p-4">
        {children}
      </div>
      <AIAnalysisModal
        open={modalOpen}
        title={title}
        content={analysisText}
        loading={loading}
        error={error}
        onClose={handleClose}
      />
    </div>
  );
}
