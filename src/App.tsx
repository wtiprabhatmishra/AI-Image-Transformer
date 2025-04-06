import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Download, 
  Loader2,
  Camera,
  Wand2,
  Palette,
  Zap,
  Grid,
  Clock,
  Lightbulb,
  Brush
} from 'lucide-react';
import { Effect } from './types';
import { applyEffect, compressImage } from './imageEffects';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [effect, setEffect] = useState<Effect>('ghibli');
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleImageUpload = useCallback(async (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setImage(compressed);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const processImage = useCallback(async () => {
    if (!image) return;
    
    setProcessing(true);
    try {
      const transformed = await applyEffect(image, effect);
      setResult(transformed);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setProcessing(false);
    }
  }, [image, effect]);

  const effects: Array<{ id: Effect; name: string; icon: React.ReactNode }> = [
    { id: 'ghibli', name: 'Ghibli Style', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'hd', name: 'HD Enhance', icon: <Camera className="w-5 h-5" /> },
    { id: 'anime', name: 'Anime Style', icon: <Wand2 className="w-5 h-5" /> },
    { id: 'pixel', name: 'Pixel Art', icon: <Grid className="w-5 h-5" /> },
    { id: 'vintage', name: 'Vintage', icon: <Clock className="w-5 h-5" /> },
    { id: 'neon', name: 'Neon Glow', icon: <Lightbulb className="w-5 h-5" /> },
    { id: 'oil', name: 'Oil Paint', icon: <Brush className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            AI Image Transformer
          </h1>
          <p className="text-lg text-gray-300">Transform your images with stunning artistic effects</p>
        </header>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div 
                  className={`relative h-80 border-2 ${
                    dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-gray-400'
                  } border-dashed rounded-lg flex items-center justify-center transition-colors`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {image ? (
                    <img 
                      src={image} 
                      alt="Preview" 
                      className="max-h-full max-w-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-400">Drop your image here or click to upload</p>
                      <p className="text-sm text-gray-500 mt-2">Supports: JPG, PNG, WebP</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {effects.map(({ id, name, icon }) => (
                    <button
                      key={id}
                      onClick={() => setEffect(id)}
                      className={`p-4 rounded-lg ${
                        effect === id 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-white/5 hover:bg-white/10'
                      } transition-all flex items-center justify-center gap-2`}
                    >
                      {icon}
                      {name}
                    </button>
                  ))}
                </div>

                <button
                  onClick={processImage}
                  disabled={!image || processing}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold 
                    disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity
                    flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Palette className="w-5 h-5" />
                      Transform Image
                    </>
                  )}
                </button>
              </div>

              <div className="relative h-80 bg-black/20 rounded-lg flex items-center justify-center overflow-hidden">
                {result ? (
                  <div className="relative group w-full h-full">
                    <img 
                      src={result} 
                      alt="Transformed" 
                      className="max-h-full max-w-full object-contain rounded-lg mx-auto"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
                      flex items-center justify-center transition-opacity">
                      <a
                        href={result}
                        download={`transformed-${effect}.jpg`}
                        className="bg-white text-black px-6 py-3 rounded-lg
                          flex items-center gap-2 hover:bg-gray-100 transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        Download Image
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 text-gray-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4" />
                    <p>Transformed image will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 text-center space-y-4">
            <h2 className="text-2xl font-semibold text-purple-300">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/5 p-6 rounded-lg">
                <Zap className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="font-semibold mb-2">Instant Processing</h3>
                <p className="text-sm text-gray-400">Transform your images in seconds with our optimized algorithms</p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg">
                <Download className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="font-semibold mb-2">Free Downloads</h3>
                <p className="text-sm text-gray-400">Download your transformed images in high quality, completely free</p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg">
                <Palette className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="font-semibold mb-2">Multiple Effects</h3>
                <p className="text-sm text-gray-400">Choose from various artistic styles and effects</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center text-gray-400">
            <p>Free for everyone • No login required • Process images directly in your browser</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;