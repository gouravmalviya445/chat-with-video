"use client";

import { MessageSource } from "@/lib/api";
import { Play } from "lucide-react";

interface SourceCitationProps {
  source: MessageSource;
  onSeek?: (seconds: number) => void;
}

export function SourceCitation({ source, onSeek }: SourceCitationProps) {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(mins)}:${pad(secs)}`;
  };

  const timeLabel = `${formatTime(source.startTime)} — ${formatTime(source.endTime)}`;

  return (
    <div className="sketch-box-sm p-2.5 bg-paper-sticky/80 border-ink text-xs text-neutral-800 transition-all hover:bg-paper-sticky">
      <div className="flex items-center justify-between gap-2 mb-1">
        <button
          onClick={() => onSeek?.(source.startTime)}
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-neutral-900 marker-highlight px-1.5 py-0.5 rounded cursor-pointer hover:scale-105 transition-transform"
          title={`Jump video to ${formatTime(source.startTime)}`}
        >
          <Play className="w-3 h-3 text-neutral-900 fill-neutral-900" />
          <span>[ {timeLabel} ]</span>
        </button>

        <span className="text-[10px] font-handwritten font-bold text-neutral-600">
          Source Clip
        </span>
      </div>

      <p className="text-[11px] text-neutral-700 italic line-clamp-2 leading-tight">
        "{source.content}"
      </p>
    </div>
  );
}
