"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  label: string;
}

export default function RangeSlider({
  min,
  max,
  value,
  onChange,
  label,
}: RangeSliderProps) {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const minValRef = useRef(value[0]);
  const maxValRef = useRef(value[1]);
  const range = useRef<HTMLDivElement>(null);

  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
    minValRef.current = value[0];
    maxValRef.current = value[1];
  }, [value]);

  return (
    <div className="w-full max-w-xl mx-auto py-2">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{label}</span>
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-800/30 shadow-sm">
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{minVal}</span>
          <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{maxVal}</span>
        </div>
      </div>

      <div className="relative h-6 flex items-center px-2">
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={(event) => {
            const val = Math.min(Number(event.target.value), maxVal - 1);
            setMinVal(val);
            minValRef.current = val;
            onChange([val, maxVal]);
          }}
          className="thumb thumb--left z-[3] w-full h-0 outline-none absolute pointer-events-none appearance-none"
          style={{ zIndex: minVal > max - 100 ? "5" : undefined }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={(event) => {
            const val = Math.max(Number(event.target.value), minVal + 1);
            setMaxVal(val);
            maxValRef.current = val;
            onChange([minVal, val]);
          }}
          className="thumb thumb--right z-[4] w-full h-0 outline-none absolute pointer-events-none appearance-none"
        />

        <div className="relative w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full">
          <div ref={range} className="absolute h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
        </div>
      </div>
      
      <div className="flex justify-between mt-3 px-2">
        <span className="text-[10px] text-zinc-400 font-bold">{min}</span>
        <span className="text-[10px] text-zinc-400 font-bold">{max}</span>
      </div>

      <style jsx>{`
        .thumb::-webkit-slider-thumb {
          background-color: #3b82f6;
          border: 4px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          cursor: pointer;
          height: 24px;
          width: 24px;
          pointer-events: all;
          position: relative;
          appearance: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .thumb::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          background-color: #2563eb;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .thumb::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }
        .dark .thumb::-webkit-slider-thumb {
          border-color: #18181b;
        }
        .thumb::-moz-range-thumb {
          background-color: #3b82f6;
          border: 4px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          cursor: pointer;
          height: 24px;
          width: 24px;
          pointer-events: all;
          position: relative;
          appearance: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dark .thumb::-moz-range-thumb {
          border-color: #18181b;
        }
      `}</style>
    </div>
  );
}
