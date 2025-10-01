import React, { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';

export default function WaveCards() {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 5, 20);

    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 2, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Create card textures with gradients
    const createCardTexture = (index) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 768;
      const ctx = canvas.getContext('2d');

      const colors = [
        ['#667eea', '#764ba2'],
        ['#f093fb', '#f5576c'],
        ['#4facfe', '#00f2fe'],
        ['#43e97b', '#38f9d7'],
        ['#fa709a', '#fee140'],
        ['#30cfd0', '#330867'],
        ['#a8edea', '#fed6e3'],
        ['#ff9a9e', '#fecfef'],
        ['#ffecd2', '#fcb69f'],
        ['#ff6e7f', '#bfe9ff'],
      ];

      const colorPair = colors[index % colors.length];
      const gradient = ctx.createLinearGradient(0, 0, 0, 768);
      gradient.addColorStop(0, colorPair[0]);
      gradient.addColorStop(1, colorPair[1]);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 768);

      // Add pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 768;
        const radius = Math.random() * 40 + 10;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add number
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 200px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString().padStart(2, '0'), 256, 384);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    // Card class
    class Card {
      constructor(index, total) {
        const texture = createCardTexture(index);
        
        const geometry = new THREE.PlaneGeometry(2, 3, 20, 20);
        
        // Bend the geometry
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const bendAmount = Math.abs(x) * 0.15;
          positions.setZ(i, bendAmount * bendAmount);
        }
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
          map: texture,
          metalness: 0.3,
          roughness: 0.4,
          side: THREE.DoubleSide,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.index = index;
        this.total = total;
        
        // Position in a wave pattern
        const angle = (index / total) * Math.PI * 2;
        const radius = 8;
        this.baseX = Math.sin(angle) * radius;
        this.baseY = Math.sin(index * 0.5) * 2;
        this.baseZ = Math.cos(angle) * radius;
        
        this.mesh.position.set(this.baseX, this.baseY, this.baseZ);
        this.mesh.rotation.y = -angle;
        
        this.targetScale = 1;
        this.hovered = false;
      }

      update(elapsed, scroll, mouse) {
        // Rotation from scroll
        const scrollRotation = scroll * Math.PI * 2;
        const angle = (this.index / this.total) * Math.PI * 2 + scrollRotation;
        
        // Wave motion
        const waveOffset = Math.sin(elapsed * 0.5 + this.index * 0.3) * 0.5;
        
        this.mesh.position.x = Math.sin(angle) * 8;
        this.mesh.position.y = this.baseY + waveOffset;
        this.mesh.position.z = Math.cos(angle) * 8;
        this.mesh.rotation.y = -angle + Math.sin(elapsed * 0.2) * 0.1;

        // Hover effect
        const scale = this.mesh.scale.x;
        this.mesh.scale.setScalar(scale + (this.targetScale - scale) * 0.1);

        // Float animation
        this.mesh.position.y += Math.sin(elapsed * 2 + this.index) * 0.002;
      }

      checkHover(raycaster) {
        const intersects = raycaster.intersectObject(this.mesh);
        const wasHovered = this.hovered;
        this.hovered = intersects.length > 0;
        this.targetScale = this.hovered ? 1.3 : 1;
        return this.hovered !== wasHovered;
      }
    }

    // Create cards
    const cardCount = 10;
    const cards = [];
    for (let i = 0; i < cardCount; i++) {
      const card = new Card(i, cardCount);
      scene.add(card.mesh);
      cards.push(card);
    }
    cardsRef.current = cards;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    const pointLight1 = new THREE.PointLight(0x667eea, 2, 20);
    pointLight1.position.set(-5, 3, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xf5576c, 2, 20);
    pointLight2.position.set(5, 3, -5);
    scene.add(pointLight2);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: 0x667eea,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Ground circle
    const groundGeometry = new THREE.CircleGeometry(15, 64);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x16213e,
      metalness: 0.5,
      roughness: 0.7,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    scene.add(ground);

    // Raycaster for hover detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Mouse interaction
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      mouse.x = mouseRef.current.x;
      mouse.y = mouseRef.current.y;
    };

    const handleWheel = (e) => {
      scrollRef.current += e.deltaY * 0.0005;
      scrollRef.current = scrollRef.current % 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel);

    // Animation
    const clock = new THREE.Clock();
    let animationId;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Update raycaster
      raycaster.setFromCamera(mouse, camera);

      // Update cards
      cards.forEach(card => {
        card.update(elapsed, scrollRef.current, mouseRef.current);
        card.checkHover(raycaster);
      });

      // Camera movement
      camera.position.x += (mouseRef.current.x * 2 - camera.position.x) * 0.05;
      camera.position.y += (-mouseRef.current.y * 2 + 2 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Animate lights
      pointLight1.position.x = Math.sin(elapsed * 0.5) * 8;
      pointLight1.position.z = Math.cos(elapsed * 0.5) * 8;
      
      pointLight2.position.x = Math.cos(elapsed * 0.7) * 8;
      pointLight2.position.z = Math.sin(elapsed * 0.7) * 8;

      // Rotate particles
      particles.rotation.y += 0.0005;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      cards.forEach(card => {
        card.mesh.geometry.dispose();
        card.mesh.material.map.dispose();
        card.mesh.material.dispose();
      });
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      groundGeometry.dispose();
      groundMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-black relative overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center z-10 pointer-events-none">
        <h1 className="text-6xl font-bold text-white mb-2">
          Wave Cards
        </h1>
        <p className="text-lg text-purple-300">
          Scroll to rotate • Hover to interact
        </p>
      </div>

      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10 flex gap-8 pointer-events-none">
        <div className="bg-white/10 backdrop-blur-md rounded-xl px-6 py-3 border border-white/20">
          <div className="text-white/60 text-xs mb-1">CARDS</div>
          <div className="text-white text-2xl font-bold">10</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl px-6 py-3 border border-white/20">
          <div className="text-white/60 text-xs mb-1">LAYOUT</div>
          <div className="text-white text-2xl font-bold">Wave</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl px-6 py-3 border border-white/20">
          <div className="text-white/60 text-xs mb-1">STYLE</div>
          <div className="text-white text-2xl font-bold">3D</div>
        </div>
      </div>

      <div className="absolute top-32 left-8 z-10 bg-black/40 backdrop-blur-md rounded-xl p-4 border border-purple-500/30 max-w-xs pointer-events-none">
        <div className="text-purple-300 text-sm font-semibold mb-2">Features</div>
        <div className="text-white/80 text-xs space-y-1">
          <div>🌊 Wave-based layout</div>
          <div>🎨 Gradient textures</div>
          <div>💫 Hover scale effect</div>
          <div>🔄 Infinite scroll rotation</div>
        </div>
      </div>
    </div>
  );
}
