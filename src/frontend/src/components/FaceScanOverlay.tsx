import { useEffect, useRef } from "react";

interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status:
    | "scanning"
    | "detected"
    | "matching"
    | "matched"
    | "not_recognized"
    | "idle";
  detectionBox?: DetectionBox | null;
  matchedName?: string;
}

export default function FaceScanOverlay({
  videoRef,
  status,
  detectionBox,
  matchedName,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const scanLineY = useRef(0);
  const direction = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const video = videoRef.current;
      if (!video || !canvas) return;

      const w = video.clientWidth || 320;
      const h = video.clientHeight || 240;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, w, h);

      const isGreen = status === "detected" || status === "matched";
      const color = isGreen
        ? "#00ff88"
        : status === "not_recognized"
          ? "#ff4444"
          : "#00ccff";

      // Corner brackets
      const bSize = 28;
      const bThick = 3;
      const margin = 16;
      ctx.strokeStyle = color;
      ctx.lineWidth = bThick;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;

      // Top-left
      ctx.beginPath();
      ctx.moveTo(margin, margin + bSize);
      ctx.lineTo(margin, margin);
      ctx.lineTo(margin + bSize, margin);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(w - margin - bSize, margin);
      ctx.lineTo(w - margin, margin);
      ctx.lineTo(w - margin, margin + bSize);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(margin, h - margin - bSize);
      ctx.lineTo(margin, h - margin);
      ctx.lineTo(margin + bSize, h - margin);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(w - margin - bSize, h - margin);
      ctx.lineTo(w - margin, h - margin);
      ctx.lineTo(w - margin, h - margin - bSize);
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Face detection box
      if (
        detectionBox &&
        (status === "detected" || status === "matching" || status === "matched")
      ) {
        const scaleX = w / (videoRef.current?.videoWidth || w);
        const scaleY = h / (videoRef.current?.videoHeight || h);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.strokeRect(
          detectionBox.x * scaleX,
          detectionBox.y * scaleY,
          detectionBox.width * scaleX,
          detectionBox.height * scaleY,
        );
        ctx.shadowBlur = 0;
      }

      // Scan line (only when scanning)
      if (status === "scanning" || status === "idle") {
        scanLineY.current += direction.current * 2;
        if (scanLineY.current >= h) direction.current = -1;
        if (scanLineY.current <= 0) direction.current = 1;

        const grad = ctx.createLinearGradient(
          0,
          scanLineY.current - 8,
          0,
          scanLineY.current + 8,
        );
        grad.addColorStop(0, "rgba(0, 204, 255, 0)");
        grad.addColorStop(0.5, "rgba(0, 204, 255, 0.5)");
        grad.addColorStop(1, "rgba(0, 204, 255, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, scanLineY.current - 8, w, 16);
      }

      // Status text
      const statusText =
        status === "scanning"
          ? "Scanning for face..."
          : status === "detected"
            ? "Face Detected ✓"
            : status === "matching"
              ? "Matching..."
              : status === "matched"
                ? `Match Found: ${matchedName ?? ""}`
                : status === "not_recognized"
                  ? "Face Not Recognized"
                  : "";

      if (statusText) {
        ctx.font = "bold 13px monospace";
        const textW = ctx.measureText(statusText).width;
        const textX = (w - textW) / 2;
        const textY = h - 20;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(textX - 8, textY - 16, textW + 16, 24);
        ctx.fillStyle = color;
        ctx.fillText(statusText, textX, textY);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [videoRef, status, detectionBox, matchedName]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
