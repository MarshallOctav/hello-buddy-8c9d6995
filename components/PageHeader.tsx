
import React, { useRef, useState } from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  bottomContent?: React.ReactNode;
  className?: string;
  blobColor1?: string;
  blobColor2?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  badge, 
  children,
  bottomContent,
  className = 'bg-slate-900',
  blobColor1 = 'bg-blue-600/20',
  blobColor2 = 'bg-indigo-600/20'
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    // Calculate normalized position (-0.5 to 0.5)
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setMousePosition({ x, y });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative mb-8 overflow-hidden rounded-[2.5rem] px-8 py-10 shadow-2xl sm:px-12 sm:py-14 animate-fade-in group ${className}`}
    >
      {/* Interactive Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className={`absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full blur-3xl transition-transform duration-200 ease-out ${blobColor1}`}
          style={{ transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * 30}px)` }}
        />
        <div 
          className={`absolute -left-20 -bottom-20 h-[400px] w-[400px] rounded-full blur-3xl transition-transform duration-200 ease-out ${blobColor2}`}
          style={{ transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * -30}px)` }}
        />
        {/* Noise Texture for Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        
        {/* Optional decorative shape */}
        <div className="absolute left-1/3 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[80px] opacity-0 transition-opacity duration-700 group-hover:opacity-100"></div>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-3xl">
            {badge && (
              <div className="mb-4 inline-flex">
                {badge}
              </div>
            )}
            <div className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.15]">
              {title}
            </div>
            {subtitle && (
              <div className="mt-4 text-lg text-slate-300 max-w-2xl leading-relaxed">
                {subtitle}
              </div>
            )}
          </div>
          {children && (
             <div className="w-full lg:w-auto shrink-0">
                {children}
             </div>
          )}
        </div>
        {bottomContent && (
           <div className="mt-10">
             {bottomContent}
           </div>
        )}
      </div>
    </div>
  );
};
