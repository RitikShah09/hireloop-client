'use client';

import { useState, useEffect, useRef, createElement } from 'react';
import { BlobProvider } from '@react-pdf/renderer';
import { Document, Page, pdfjs } from 'react-pdf';
import { ResumePDF } from './ResumePDF';
import type { ResumeBuilderState } from './types';
import { Loader2 } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  data: ResumeBuilderState;
}

export function ResumePDFViewer({ data }: Props) {
  const [debouncedData, setDebouncedData] = useState(data);
  const [blobKey, setBlobKey] = useState(0);
  const [numPages, setNumPages] = useState(0);

  const [pageWidth, setPageWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const A4 = 210 / 297;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedData(data);
      setBlobKey((k) => k + 1);
    }, 800);
    return () => clearTimeout(t);
  }, [data]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = (w: number, h: number) => {
      if (w <= 0) return;
      const pad = 16;
      const byWidth = w - pad;
      const byHeight = (h - pad) * A4;

      setPageWidth(Math.min(byWidth, h > 0 ? byHeight : byWidth, 900));
    };

    measure(el.clientWidth, el.clientHeight);

    const ro = new ResizeObserver((entries) => {
      const { width = 0, height = 0 } = entries[0]?.contentRect ?? {};
      measure(width, height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full overflow-x-hidden overflow-y-auto">
      <BlobProvider
        key={blobKey}
        document={createElement(ResumePDF, { data: debouncedData }) as any}
      >
        {({ url, loading: blobLoading }) =>
          blobLoading || !url || pageWidth === 0 ? (
            <div className="flex h-full min-h-100 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={22} className="text-primary animate-spin" />
                <p className="text-muted-foreground text-xs">Rendering preview…</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 overflow-x-hidden py-4 sm:px-2">
              <Document
                file={url}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={
                  <div className="flex min-h-100 items-center justify-center">
                    <Loader2 size={20} className="text-primary animate-spin" />
                  </div>
                }
                error={
                  <p className="text-muted-foreground py-12 text-center text-sm">
                    Failed to load preview
                  </p>
                }
              >
                {Array.from({ length: numPages }, (_, i) => (
                  <div
                    key={i}
                    className={`overflow-hidden rounded bg-white shadow-sm ring-1 ring-black/5 ${i > 0 ? 'mt-4' : ''}`}
                  >
                    <Page
                      pageNumber={i + 1}
                      width={pageWidth}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                    />
                  </div>
                ))}
              </Document>
            </div>
          )
        }
      </BlobProvider>
    </div>
  );
}
