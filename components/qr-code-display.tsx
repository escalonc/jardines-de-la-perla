"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Share, Download, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  invite: Invite;
}

export function QRCodeDisplay({ invite }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>(""); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [shareSupported, setShareSupported] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if Web Share API is supported
  useEffect(() => {
    setShareSupported(
      typeof navigator !== "undefined" &&
        !!navigator.share &&
        !!navigator.canShare
    );
  }, []);

  useEffect(() => {
    if (!invite) return;

    // Generate QR code data
    const qrData = JSON.stringify({
      id: invite.id,
      name: invite.name,
      guests: invite.guests,
    });

    // Generate QR code on canvas
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        qrData,
        {
          width: 200, // Increased QR code size
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
        width: 200, // Increased QR code size
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
          if (blob) setImageBlob(blob);
        });
      }
    );
  }, [invite]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Handle sharing via Web Share API
  const handleShare = async () => {
    if (!imageBlob) {
      toast("Cannot share", {
        description:
          "There was an error preparing the image. Please try again.",
      });
      return;
    }

    try {
      // Check if sharing is supported
      if (shareSupported) {
        // Try text-only sharing first (more compatible)
        const shareData = {
          title: `Invite for ${invite.name}`,
          text: `QR code invite for ${invite.name}: ${invite.title}`,
        };

        // Check if we can share this data
        if (navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }

        // Try with file if text sharing isn't available
        const fileShareData = {
          title: `Invite for ${invite.name}`,
          text: `QR code invite for ${invite.name}`,
          files: [new File([imageBlob], "invite.png", { type: "image/png" })],
        };

        // Check if we can share with files
        if (navigator.canShare && navigator.canShare(fileShareData)) {
          await navigator.share(fileShareData);
          return;
        }
      }

      // If we get here, sharing isn't fully supported - fall back to download
      downloadImage();
    } catch (error) {
      console.error("Error during share:", error);
      // Fall back to download if sharing fails
      downloadImage();
    }
  };

  // Download the image
  const downloadImage = () => {
    if (!imageBlob) {
      toast("Cannot download", {
        description:
          "There was an error preparing the image. Please try again.",
      });
      return;
    }

    const url = URL.createObjectURL(imageBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invite-${invite.name.toLowerCase().replace(/\s+/g, "-")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast("Image downloaded", {
      description: "The invite image has been downloaded to your device.",
    });
  };

  // Copy the invite details to clipboard
  const copyToClipboard = async () => {
    const text = `Invitación para: ${invite.name}\nTitle: ${invite.title}\nguests: ${invite.guests}\nDetails: ${invite.description}`;

    try {
      await navigator.clipboard.writeText(text);
      toast("Copied to clipboard", {
        description: "Invite details copied to clipboard.",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast("Copy failed", {
        description:
          "Could not copy to clipboard. Your browser may not support this feature.",
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center space-y-4 p-4 border rounded-lg w-full max-w-xs mx-auto bg-white"
    >
      <div className="text-center">
        <h3 className="font-bold text-lg">{invite.title}</h3>
        <p className="text-sm text-muted-foreground">Para: {invite.name}</p>
        <p className="text-xs text-muted-foreground">
          Acompañantes: {invite.guests}
        </p>
      </div>

      <div className="bg-white p-2 rounded-md">
        <canvas ref={canvasRef} />
      </div>

      <p className="text-xs text-center text-muted-foreground">
        {invite.description}
      </p>

      {/* Dropdown menu for sharing options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-full">
            <Share className="w-4 h-4 mr-2" />
            Compartir
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          {shareSupported && (
            <DropdownMenuItem onClick={handleShare}>
              <Share className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={downloadImage}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
