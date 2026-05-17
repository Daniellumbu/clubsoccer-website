"use client";

import { useEffect, useRef, useState } from "react";

const CROP_SIZE = 260;

export function ImageCropper({ src, onDone, onCancel }: {
  src: string;
  onDone: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const posRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const dragRef = useRef<{ cx: number; cy: number; px: number; py: number } | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      imgRef.current = img;
      const s = Math.max(CROP_SIZE / img.naturalWidth, CROP_SIZE / img.naturalHeight);
      scaleRef.current = s;
      posRef.current = {
        x: (CROP_SIZE - img.naturalWidth * s) / 2,
        y: (CROP_SIZE - img.naturalHeight * s) / 2,
      };
      setReady(true);
    };
    img.src = src;
    return () => { img.onload = null; };
  }, [src]);

  function draw() {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);
    ctx.drawImage(img, posRef.current.x, posRef.current.y, img.naturalWidth * scaleRef.current, img.naturalHeight * scaleRef.current);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready) draw(); }, [ready]);

  function startDrag(cx: number, cy: number) {
    dragRef.current = { cx, cy, px: posRef.current.x, py: posRef.current.y };
  }
  function moveDrag(cx: number, cy: number) {
    if (!dragRef.current) return;
    posRef.current = { x: dragRef.current.px + (cx - dragRef.current.cx), y: dragRef.current.py + (cy - dragRef.current.cy) };
    draw();
  }
  function endDrag() { dragRef.current = null; }

  function handleDone() {
    canvasRef.current?.toBlob((blob) => { if (blob) onDone(blob); }, "image/jpeg", 0.92);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-xs">
        <p className="font-semibold text-gray-900 mb-1">Center your photo</p>
        <p className="text-xs text-gray-400 mb-4">Drag to reposition inside the circle</p>
        <div className="mx-auto overflow-hidden rounded-full border-4 border-carleton-blue" style={{ width: CROP_SIZE, height: CROP_SIZE }}>
          {ready ? (
            <canvas
              ref={canvasRef}
              width={CROP_SIZE}
              height={CROP_SIZE}
              className="cursor-grab active:cursor-grabbing"
              style={{ touchAction: "none" }}
              onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
              onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onTouchStart={(e) => { const t = e.touches[0]; startDrag(t.clientX, t.clientY); }}
              onTouchMove={(e) => { const t = e.touches[0]; moveDrag(t.clientX, t.clientY); }}
              onTouchEnd={endDrag}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 animate-pulse" />
          )}
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button type="button" onClick={onCancel} className="border border-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-100">Cancel</button>
          <button type="button" onClick={handleDone} disabled={!ready} className="bg-carleton-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">Done</button>
        </div>
      </div>
    </div>
  );
}
