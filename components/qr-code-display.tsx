"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QRCodeDisplayProps {
  invite: Invite;
  onShareSupported?: (supported: boolean) => void;
  onImageBlobGenerated?: (blob: Blob) => void;
  className?: string;
  size?: number;
  quality?: number;
  format?: "png" | "jpeg" | "webp";
  compact?: boolean;
}

export function QRCodeDisplay({
  invite,
  onShareSupported,
  onImageBlobGenerated,
  className,
  size = 220,
  quality = 0.92,
  format = "png",
  compact = false,
}: QRCodeDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if Web Share API is supported
  useEffect(() => {
    const supported =
      typeof navigator !== "undefined" &&
      !!navigator.share &&
      !!navigator.canShare;
    onShareSupported?.(supported);
  }, [onShareSupported]);

  const generateImageBlob = useCallback(
    async (qrUrl: string): Promise<Blob | null> => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        // Set canvas size with better proportions
        canvas.width = 800;
        canvas.height = 1000;

        // Create gradient background
        const gradient = ctx.createLinearGradient(
          0,
          0,
          canvas.width,
          canvas.height,
        );
        gradient.addColorStop(0, "#f8fafc");
        gradient.addColorStop(1, "#f1f5f9");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add a subtle pattern
        ctx.fillStyle = "#ffffff15";
        for (let i = 0; i < canvas.width; i += 20) {
          for (let j = 0; j < canvas.height; j += 20) {
            ctx.fillRect(i, j, 10, 10);
          }
        }

        // Draw main content container
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        roundRect(ctx, 50, 50, canvas.width - 100, canvas.height - 100, 30);
        ctx.fill();
        ctx.shadowColor = "transparent";

        // Add title
        ctx.font = "bold 48px system-ui";
        ctx.fillStyle = "#0f172a";
        ctx.textAlign = "center";
        ctx.fillText(invite.title, canvas.width / 2, 150);

        // Add invitee name
        ctx.font = "32px system-ui";
        ctx.fillStyle = "#475569";
        ctx.fillText(`Para: ${invite.name}`, canvas.width / 2, 220);

        // Add guests count
        ctx.font = "28px system-ui";
        ctx.fillStyle = "#64748b";
        ctx.fillText(`Acompañantes: ${invite.guests}`, canvas.width / 2, 270);

        // Draw QR code
        const qrImage = new Image();
        qrImage.crossOrigin = "anonymous";
        qrImage.src = qrUrl;

        await new Promise((resolve, reject) => {
          qrImage.onload = resolve;
          qrImage.onerror = reject;
        });

        // Draw QR code background
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0, 0, 0, 0.05)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        roundRect(ctx, canvas.width / 2 - 200, 320, 400, 400, 24);
        ctx.fill();
        ctx.shadowColor = "transparent";

        // Center QR code
        const qrX = (canvas.width - qrImage.width) / 2;
        ctx.drawImage(qrImage, qrX, 370);

        // Add description
        ctx.font = "24px system-ui";
        ctx.fillStyle = "#64748b";
        ctx.fillText(invite.description || "", canvas.width / 2, 820);

        // Add decorative elements
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 150, 780);
        ctx.lineTo(canvas.width / 2 + 150, 780);
        ctx.stroke();

        // Convert to blob with specified format and quality
        return new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                onImageBlobGenerated?.(blob);
                resolve(blob);
              } else {
                reject(new Error("Failed to generate image blob"));
              }
            },
            `image/${format}`,
            quality,
          );
        });
      } catch (error) {
        console.error("Error generating image:", error);
        toast.error(
          "Error al generar la imagen. Por favor, intente nuevamente.",
        );
        return null;
      }
    },
    [invite, format, quality, onImageBlobGenerated],
  );

  // Generate QR code with error handling
  const generateQRCode = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const qrData = JSON.stringify({
        id: invite.id,
        name: invite.name,
        guests: invite.guests,
      });

      // Generate QR code on canvas
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, qrData, {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
          errorCorrectionLevel: "H",
        });
      }

      // Generate QR code as data URL
      const url = await QRCode.toDataURL(qrData, {
        width: size * 1.5,
        margin: 2,
        errorCorrectionLevel: "H",
      });

      await generateImageBlob(url);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to generate QR code");
      setError(error);
      toast.error(
        "Error al generar el código QR. Por favor, intente nuevamente.",
      );
      console.error("QR generation error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [invite, size, generateImageBlob]);

  useEffect(() => {
    generateQRCode();
    const canvas = canvasRef.current;
    return () => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [generateQRCode]);

  // Helper function to draw rounded rectangles
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  if (error) {
    return (
      <div
        ref={containerRef}
        className={cn(
          "mx-auto flex w-full max-w-md flex-col items-center space-y-2 rounded-xl border bg-gradient-to-b from-white to-gray-50/50 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] backdrop-blur-sm md:space-y-4",
          className,
        )}
        role="alert"
        aria-live="assertive"
      >
        <div className="text-center">
          <h3 className="text-lg font-bold text-red-600">Error</h3>
          <p className="text-muted-foreground">
            No se pudo generar el código QR. Por favor, intente nuevamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "mx-auto flex w-full flex-col items-center space-y-2 rounded-xl border bg-gradient-to-b from-white to-gray-50/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] backdrop-blur-sm",
        compact ? "p-3 md:p-4" : "max-w-md p-6 md:space-y-4",
        className,
      )}
      role="region"
      aria-label="Código QR de invitación"
    >
      <div className="text-center">
        <h3
          className={cn(
            "font-bold tracking-tight text-gray-900",
            compact ? "text-base" : "text-lg md:text-xl",
          )}
        >
          {invite.title}
        </h3>
        <p
          className={cn(
            "text-muted-foreground/80 font-medium",
            compact ? "text-xs" : "text-sm md:text-base",
          )}
        >
          Para: {invite.name}
        </p>
        <p
          className={cn(
            "text-muted-foreground/70",
            compact ? "text-xs" : "text-sm",
          )}
        >
          Acompañantes: {invite.guests}
        </p>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]",
          compact ? "p-1" : "p-1 md:p-5",
        )}
        aria-busy={isLoading}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div
              className={cn(
                "animate-spin rounded-full border-4 border-gray-300 border-t-gray-600",
                compact ? "h-6 w-6" : "h-8 w-8",
              )}
            />
          </div>
        )}
        <canvas ref={canvasRef} aria-label="Código QR" role="img" />
      </div>

      <p
        className={cn(
          "text-muted-foreground/60 text-center font-medium",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {invite.description}
      </p>
    </div>
  );
}
