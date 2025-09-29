import React, { useEffect, useRef } from 'react';

export default function ParticleSystem() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = `hsl(${Math.random() * 60 + 180}, 100%, ${Math.random() * 30 + 50}%)`;
        this.life = 1;
        this.decay = Math.random() * 0.01 + 0.005;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        
        // Mouse attraction
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          this.speedX += (dx / distance) * force * 0.2;
          this.speedY += (dy / distance) * force * 0.2;
        }

        // Add slight friction
        this.speedX *= 0.99;
        this.speedY *= 0.99;

        // Gravity
        this.speedY += 0.05;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
        
        ctx.restore();
      }
    }

    function createParticles(x, y, count = 5) {
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(new Particle(x, y));
      }
    }

    function handleMouseMove(e) {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      createParticles(e.clientX, e.clientY, 3);
    }

    function handleClick(e) {
      createParticles(e.clientX, e.clientY, 30);
    }

    function animate() {
      ctx.fillStyle = 'rgba(10, 10, 20, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.update();
        p.draw();

        // Remove dead particles
        if (p.life <= 0 || p.y > canvas.height + 50) {
          particlesRef.current.splice(i, 1);
        }
      }

      // Draw connections between nearby particles
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.1)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const dx = particlesRef.current[i].x - particlesRef.current[j].x;
          const dy = particlesRef.current[i].y - particlesRef.current[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.globalAlpha = (1 - distance / 100) * 0.5;
            ctx.beginPath();
            ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
            ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      animationId = requestAnimationFrame(animate);
    }

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    
    // Initial burst
    createParticles(canvas.width / 2, canvas.height / 2, 50);
    
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          background: 'linear-gradient(to bottom, #0a0a14, #1a1a2e)',
          cursor: 'crosshair'
        }}
      />
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'rgba(255, 255, 255, 0.7)',
        fontFamily: 'monospace',
        fontSize: '14px',
        textShadow: '0 0 10px rgba(100, 150, 255, 0.8)'
      }}>
        Move mouse to create particles • Click for burst
      </div>
    </div>
  );
}
