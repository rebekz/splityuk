"use client";

import { useEffect, useRef } from "react";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

// Simple QR code generator using canvas
export function QRCodeDisplay({ value, size = 200 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    // Generate a simple pattern based on the URL hash
    // In production, use a proper QR library like 'qrcode'
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const moduleCount = 25;
    const moduleSize = size / moduleCount;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Generate pattern from hash
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    // Draw finder patterns (corners)
    const drawFinderPattern = (x: number, y: number) => {
      ctx.fillStyle = "#000000";
      // Outer square
      ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
      ctx.fillStyle = "#000000";
      ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
    };

    drawFinderPattern(0, 0);
    drawFinderPattern(moduleCount - 7, 0);
    drawFinderPattern(0, moduleCount - 7);

    // Generate data modules
    ctx.fillStyle = "#000000";
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Skip finder pattern areas
        if (
          (row < 8 && col < 8) ||
          (row < 8 && col >= moduleCount - 8) ||
          (row >= moduleCount - 8 && col < 8)
        ) {
          continue;
        }

        // Generate pseudo-random pattern
        hash = ((hash * 1103515245) + 12345) & 0x7fffffff;
        if (hash % 3 === 0) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }
  }, [value, size]);

  return (
    <div className="p-4 bg-white rounded-lg">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="mx-auto"
      />
      <p className="text-xs text-center mt-2 text-muted-foreground">
        Scan untuk membuka tagihan
      </p>
    </div>
  );
}
