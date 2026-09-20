import React, { useEffect, useRef } from 'react';

interface NatureParticlesProps {
  className?: string;
  count?: number;
  interactive?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  color: string;
  pulseSpeed: number;
  pulseOffset: number;
}

export const NatureParticles: React.FC<NatureParticlesProps> = ({
  className = '',
  count = 45,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const colors = [
      '217, 119, 6',   // Rich golden amber mote
      '225, 29, 72',   // Sunset rose
      '147, 51, 234',  // Evening twilight violet
      '5, 150, 105',   // Mountain pine green
      '234, 88, 12',   // Warm peach dusk ember
    ];

    const particles: Particle[] = Array.from({ length: count }, () => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const baseAlpha = 0.2 + Math.random() * 0.35;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -0.2 - Math.random() * 0.45, // Gentle upward drift like sunlit pollen/fireflies
        size: 1.2 + Math.random() * 2.6,
        baseAlpha,
        alpha: baseAlpha,
        color,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseOffset: Math.random() * Math.PI * 2,
      };
    });

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    if (interactive && canvas.parentElement) {
      canvas.parentElement.addEventListener('mousemove', handleMouseMove);
      canvas.parentElement.addEventListener('mouseleave', handleMouseLeave);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Subtle drift with soft oscillation
        p.x += p.vx + Math.sin(tick * 0.015 + p.pulseOffset) * 0.2;
        p.y += p.vy;

        // Subtle pulsing glow
        p.alpha = p.baseAlpha + Math.sin(tick * p.pulseSpeed + p.pulseOffset) * 0.25;
        p.alpha = Math.max(0.1, Math.min(0.9, p.alpha));

        // Interactive gentle repulsion from cursor
        if (mouseX > -500) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const force = (110 - dist) / 110;
            p.x += (dx / dist) * force * 2.2;
            p.y += (dy / dist) * force * 2.2;
          }
        }

        // Screen boundary wrap
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw glowing particle
        ctx.beginPath();
        const rad = p.size;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 2.5);
        grad.addColorStop(0, `rgba(${p.color}, ${p.alpha})`);
        grad.addColorStop(0.5, `rgba(${p.color}, ${p.alpha * 0.5})`);
        grad.addColorStop(1, `rgba(${p.color}, 0)`);

        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, rad * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      if (interactive && canvas?.parentElement) {
        canvas.parentElement.removeEventListener('mousemove', handleMouseMove);
        canvas.parentElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [count, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  );
};
