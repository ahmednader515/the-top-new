"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

type SubjectChip = {
  value: string;
  label: string;
  icon: string;
  count: number;
};

interface SubjectFilterCarouselProps {
  selectedSubject: string;
  subjects: SubjectChip[];
}

export function SubjectFilterCarousel({
  selectedSubject,
  subjects,
}: SubjectFilterCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (direction: "next" | "prev") => {
    const node = containerRef.current;
    if (!node) return;
    const delta = direction === "next" ? 180 : -180;
    node.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => scrollByAmount("next")}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
        aria-label="السابق"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div ref={containerRef} className="no-scrollbar flex-1 overflow-x-auto">
        <div className="flex min-w-max snap-x snap-mandatory items-center gap-2 px-1">
          <Link
            href="/dashboard?subject=ALL"
            className={`snap-start rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition ${
              selectedSubject === "ALL"
                ? "border-brand bg-brand text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            الكل
          </Link>
          {subjects.map((subject) => {
            const isActive = subject.value === selectedSubject;
            return (
              <Link
                key={subject.value}
                href={`/dashboard?subject=${subject.value}`}
                className={`snap-start rounded-full border px-3.5 py-2 text-sm font-medium shadow-sm transition ${
                  isActive
                    ? "border-brand bg-brand text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <span>{subject.icon}</span>
                  <span className="whitespace-nowrap">{subject.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {subject.count}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollByAmount("prev")}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
        aria-label="التالي"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    </div>
  );
}
