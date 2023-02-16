import React, { useRef, useState, useEffect } from 'react';

interface Props {
  images: string[];
  onOverlayGenerated: (overlay: string | null) => void;
}

export default function ImageOverlay({ images, onOverlayGenerated }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [overlay, setOverlay] = useState<string | null>(null);

  async function generateOverlay(images: string[]) {
    const canvas = canvasRef.current;
    const ctx = canvas!.getContext('2d')!;
    const imageObjects = await Promise.all(images.map(img => createImageObject(img)));

    // Create a blank image with the same size as the first image
    const width = imageObjects[0].width;
    const height = imageObjects[0].height;
    canvas!.width = width;
    canvas!.height = height;

    // Make the canvas background transparent
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(0, 0, canvas!.width, canvas!.height);

    // Composite each image on top of the transparent canvas
    ctx.globalCompositeOperation = 'source-over';
    imageObjects.forEach((img, index) => {
        ctx.drawImage(img, 0, 0);
    });

    // Convert the overlay image to a base64 string
    const base64 = canvas!.toDataURL('image/png');
    setOverlay(base64);

    onOverlayGenerated(base64);
  }

  function createImageObject(base64: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = base64;
    });
  }

  useEffect(() => {
    if (canvasRef.current && images) {
      generateOverlay(images);
    }
  }, [images]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
}
