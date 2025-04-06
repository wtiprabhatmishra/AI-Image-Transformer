import { Effect } from './types';

const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export const applyEffect = async (
  originalImage: string,
  effect: Effect
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d')!;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      switch (effect) {
        case 'ghibli':
          // Ghibli-like soft, pastel effect
          ctx.filter = 'saturate(1.3) brightness(1.1) contrast(0.9)';
          ctx.drawImage(canvas, 0, 0);
          ctx.filter = 'none';
          break;

        case 'hd':
          // Enhance sharpness and details
          ctx.filter = 'contrast(1.2) saturate(1.1) brightness(1.05)';
          ctx.drawImage(canvas, 0, 0);
          ctx.filter = 'none';
          break;

        case 'anime':
          // Anime style effect
          ctx.filter = 'saturate(1.5) contrast(1.4) brightness(1.1)';
          ctx.drawImage(canvas, 0, 0);
          // Add edge detection
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;
          for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const gray = (r + g + b) / 3;
            pixels[i] = pixels[i + 1] = pixels[i + 2] = gray > 127 ? 255 : 0;
          }
          ctx.putImageData(imageData, 0, 0);
          break;

        case 'pixel':
          // Pixelation effect
          const pixelSize = 8;
          const tempCanvas = createCanvas(
            canvas.width / pixelSize,
            canvas.height / pixelSize
          );
          const tempCtx = tempCanvas.getContext('2d')!;
          tempCtx.drawImage(
            canvas,
            0,
            0,
            canvas.width / pixelSize,
            canvas.height / pixelSize
          );
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(
            tempCanvas,
            0,
            0,
            canvas.width / pixelSize,
            canvas.height / pixelSize,
            0,
            0,
            canvas.width,
            canvas.height
          );
          break;

        case 'vintage':
          // Vintage effect
          ctx.filter = 'sepia(0.8) contrast(1.1) brightness(0.9) blur(0.5px)';
          ctx.drawImage(canvas, 0, 0);
          ctx.filter = 'none';
          break;

        case 'neon':
          // Neon glow effect
          ctx.filter = 'saturate(2) contrast(1.5) brightness(1.2)';
          ctx.drawImage(canvas, 0, 0);
          ctx.filter = 'none';
          ctx.globalCompositeOperation = 'screen';
          ctx.fillStyle = 'rgba(0, 150, 255, 0.1)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = 'source-over';
          break;

        case 'oil':
          // Oil painting effect
          const radius = 4;
          const intensity = 30;
          const oilImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const oilPixels = oilImageData.data;
          const pixelsCopy = new Uint8ClampedArray(oilPixels);
          
          for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
              const intensityCount: number[] = new Array(intensity).fill(0);
              const redCount: number[] = new Array(intensity).fill(0);
              const greenCount: number[] = new Array(intensity).fill(0);
              const blueCount: number[] = new Array(intensity).fill(0);

              for (let rx = -radius; rx <= radius; rx++) {
                for (let ry = -radius; ry <= radius; ry++) {
                  const px = x + rx;
                  const py = y + ry;
                  
                  if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
                    const i = (py * canvas.width + px) * 4;
                    const r = pixelsCopy[i];
                    const g = pixelsCopy[i + 1];
                    const b = pixelsCopy[i + 2];
                    const curr = Math.floor((r + g + b) / 3 * intensity / 255);
                    intensityCount[curr]++;
                    redCount[curr] += r;
                    greenCount[curr] += g;
                    blueCount[curr] += b;
                  }
                }
              }

              let maxIndex = 0;
              for (let i = 1; i < intensity; i++) {
                if (intensityCount[i] > intensityCount[maxIndex]) {
                  maxIndex = i;
                }
              }

              const i = (y * canvas.width + x) * 4;
              oilPixels[i] = Math.floor(redCount[maxIndex] / intensityCount[maxIndex]);
              oilPixels[i + 1] = Math.floor(greenCount[maxIndex] / intensityCount[maxIndex]);
              oilPixels[i + 2] = Math.floor(blueCount[maxIndex] / intensityCount[maxIndex]);
            }
          }
          
          ctx.putImageData(oilImageData, 0, 0);
          break;
      }

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = originalImage;
  });
};

export const compressImage = (
  dataUrl: string,
  maxWidth = 1200,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.floor((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
};