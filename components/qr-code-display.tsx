"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface QRCodeDisplayProps {
  invite: Invite;
  compact?: boolean;
  onShareSupported?: (supported: boolean) => void;
  onImageBlobGenerated?: (blob: Blob) => void;
}

export function QRCodeDisplay({
  invite,
  compact = false,
  onShareSupported,
  onImageBlobGenerated,
}: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>(""); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [shareSupported, setShareSupported] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Check if Web Share API is supported
  useEffect(() => {
    const supported =
      typeof navigator !== "undefined" &&
      !!navigator.share &&
      !!navigator.canShare;
    setShareSupported(supported);
    onShareSupported?.(supported);
  }, [onShareSupported]);

  useEffect(() => {
    if (!invite) return;

    // Generate QR code data
    const qrData = JSON.stringify({
      id: invite.id,
      name: invite.name,
      guests: invite.guests,
    });

    // Determine QR code size based on compact mode and device
    const qrSize = compact ? 120 : isMobile ? 150 : 200;

    // Generate QR code on canvas
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        qrData,
        {
          width: qrSize,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        },
        (error) => {
          if (error) console.error(error);
        }
      );
    }

    // Generate QR code as data URL for sharing
    QRCode.toDataURL(
      qrData,
      {
        width: 200, // Keep this larger for sharing
        margin: 1,
      },
      (err, url) => {
        if (err) {
          console.error(err);
          return;
        }
        setQrDataUrl(url);

        // Pre-generate the image blob for sharing/downloading
        generateImageBlob(url).then((blob) => {
          if (blob) {
            setImageBlob(blob);
            onImageBlobGenerated?.(blob);
          }
        });
      }
    );
  }, [invite, isMobile, compact]); // eslint-disable-line react-hooks/exhaustive-deps

  // Generate the combined image with QR code and text
  const generateImageBlob = async (qrUrl: string): Promise<Blob | null> => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Set canvas size - increased height
      canvas.width = 300;
      canvas.height = 450;

      // Fill background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw border
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Add title (now fixed as "Jardines de La Perla")
      ctx.font = "bold 18px Arial";
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.fillText(invite.title, canvas.width / 2, 40);

      // Add invitee name
      ctx.font = "16px Arial";
      ctx.fillText(`Para: ${invite.name}`, canvas.width / 2, 70);

      // Add guests
      ctx.fillText(`Acompañantes: ${invite.guests}`, canvas.width / 2, 100);

      // Draw QR code
      const qrImage = new Image();
      qrImage.crossOrigin = "anonymous";
      qrImage.src = qrUrl;

      await new Promise((resolve) => {
        qrImage.onload = resolve;
      });

      // Center QR code
      const qrX = (canvas.width - qrImage.width) / 2;
      ctx.drawImage(qrImage, qrX, 130);

      // Add description (now fixed as "invite code")
      ctx.font = "14px Arial";
      ctx.fillStyle = "#4b5563";
      ctx.fillText(invite.description || "", canvas.width / 2, 380); // Adjusted position

      // Convert to blob
      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to generate image blob"));
        }, "image/png");
      });
    } catch (error) {
      console.error("Error generating image:", error);
      return null;
    }
  };

  // For compact mode (used in mobile side-by-side view)
  if (compact) {
    return (
      <div
        ref={containerRef}
        className="flex flex-col items-center space-y-1 p-2 border rounded-lg w-full bg-white"
      >
        <div className="text-center">
          <p className="text-xs font-medium">For: {invite.name}</p>
          <p className="text-xs text-muted-foreground">
            Acompañantes: {invite.guests}
          </p>
        </div>

        <div className="bg-white rounded-md">
          <canvas ref={canvasRef} />
        </div>

        {/* <Button
          onClick={shareSupported ? handleShare : downloadImage}
          className="w-full h-7 text-xs"
        >
          <Share className="w-3 h-3 mr-1" />
          {shareSupported ? "Share" : "Download"}
        </Button> */}
      </div>
    );
  }

  // Standard display for desktop and non-compact views
  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center space-y-2 md:space-y-4 p-3 md:p-4 border rounded-lg w-full max-w-xs mx-auto bg-white"
    >
      <div className="text-center">
        <h3 className="font-bold text-base md:text-lg">{invite.title}</h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          Para: {invite.name}
        </p>
        <p className="text-xs text-muted-foreground">
          Acompañantes: {invite.guests}
        </p>
      </div>

      <div className="bg-white p-1 md:p-2 rounded-md">
        <canvas ref={canvasRef} />
      </div>

      <p className="text-xs text-center text-muted-foreground">
        {invite.description}
      </p>
    </div>
  );
}
