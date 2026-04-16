import { useEffect, useRef } from 'react';

export default function WaveCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let   animId;
    let   t = 0;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const waves = [
      { amp: 38, freq: 0.0018, speed: 0.012, y: 0.55, alpha: 0.07 },
      { amp: 28, freq: 0.0025, speed: 0.018, y: 0.60, alpha: 0.05 },
      { amp: 50, freq: 0.0012, speed: 0.008, y: 0.50, alpha: 0.04 },
      { amp: 22, freq: 0.0032, speed: 0.022, y: 0.65, alpha: 0.035 },
    ];

    const particles = Array.from({ length: 28 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      r:     Math.random() * 1.5 + 0.5,
      vx:    (Math.random() - 0.5) * 0.25,
      vy:    (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.35 + 0.05,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      waves.forEach((w) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * w.y);

        for (let x = 0; x <= canvas.width; x += 4) {
          const y = canvas.height * w.y
            + Math.sin(x * w.freq + t * w.speed) * w.amp
            + Math.sin(x * w.freq * 1.7 + t * w.speed * 1.3) * (w.amp * 0.4);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, canvas.height * (w.y - 0.1), 0, canvas.height);
        grad.addColorStop(0, `rgba(201,168,76,${w.alpha})`);
        grad.addColorStop(1, 'rgba(201,168,76,0)');
        ctx.fillStyle = grad;
        ctx.fill();
      });

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${p.alpha})`;
        ctx.fill();
      });

      t++;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
