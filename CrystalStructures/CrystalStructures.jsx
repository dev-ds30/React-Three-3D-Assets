import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export default function CrystalStructures() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const crystalsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0515);
    scene.fog = new THREE.Fog(0x0a0515, 8, 20);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Create diamond geometry
    const createDiamondGeometry = () => {
      const geometry = new THREE.ConeGeometry(1, 2, 8);
      const positions = geometry.attributes.position;
      
      for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        if (y > 0) {
          positions.setY(i, y * 0.6);
        } else {
          positions.setY(i, y * 1.2);
        }
      }
      
      geometry.computeVertexNormals();
      return geometry;
    };

    // Create shard geometry
    const createShardGeometry = () => {
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        0, 2, 0,
        -0.5, 0, 0.5,
        0.5, 0, 0.5,
        
        0, 2, 0,
        0.5, 0, 0.5,
        0.5, 0, -0.5,
        
        0, 2, 0,
        0.5, 0, -0.5,
        -0.5, 0, -0.5,
        
        0, 2, 0,
        -0.5, 0, -0.5,
        -0.5, 0, 0.5,
        
        -0.5, 0, 0.5,
        0.5, 0, 0.5,
        0, -0.5, 0,
        
        0.5, 0, 0.5,
        0.5, 0, -0.5,
        0, -0.5, 0,
        
        0.5, 0, -0.5,
        -0.5, 0, -0.5,
        0, -0.5, 0,
        
        -0.5, 0, -0.5,
        -0.5, 0, 0.5,
        0, -0.5, 0,
      ]);
      
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geometry.computeVertexNormals();
      return geometry;
    };

    // Crystal material with refraction
    const createCrystalMaterial = (color, intensity = 1) => {
      return new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.95,
        transparent: true,
        opacity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        ior: 2.4,
        thickness: 1.0,
        envMapIntensity: intensity,
        emissive: color,
        emissiveIntensity: 0.2,
      });
    };

    // Create crystal cluster
    const crystalConfigs = [
      { pos: [0, 0, 0], scale: 1.5, color: 0x00ffff, type: 'diamond' },
      { pos: [-3, -0.5, 1], scale: 1, color: 0xff00ff, type: 'shard' },
      { pos: [3, -0.3, 0.5], scale: 0.8, color: 0x00ff88, type: 'diamond' },
      { pos: [-2, -0.8, -2], scale: 0.7, color: 0xffff00, type: 'shard' },
      { pos: [2.5, -0.6, -1.5], scale: 0.9, color: 0xff0088, type: 'diamond' },
      { pos: [0, -0.4, -3], scale: 0.6, color: 0x0088ff, type: 'shard' },
      { pos: [-1, -0.5, 2], scale: 0.5, color: 0x88ff00, type: 'diamond' },
      { pos: [1.5, -0.7, 2.5], scale: 0.6, color: 0xff8800, type: 'shard' },
    ];

    crystalConfigs.forEach((config, idx) => {
      const geometry = config.type === 'diamond' 
        ? createDiamondGeometry() 
        : createShardGeometry();
      
      const material = createCrystalMaterial(config.color, 1.5);
      const crystal = new THREE.Mesh(geometry, material);
      
      crystal.position.set(...config.pos);
      crystal.scale.set(config.scale, config.scale, config.scale);
      crystal.rotation.y = Math.random() * Math.PI;
      crystal.rotation.z = (Math.random() - 0.5) * 0.3;
      crystal.castShadow = true;
      crystal.receiveShadow = true;
      
      crystal.userData = {
        originalY: config.pos[1],
        floatSpeed: 0.5 + Math.random() * 0.5,
        floatOffset: Math.random() * Math.PI * 2,
        rotationSpeed: 0.2 + Math.random() * 0.3,
        index: idx,
      };
      
      scene.add(crystal);
      crystalsRef.current.push(crystal);
    });

    // Ground plane with subtle glow
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a0a2e,
      roughness: 0.8,
      metalness: 0.2,
      emissive: 0x0a0515,
      emissiveIntensity: 0.5,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Dramatic lighting
    const ambientLight = new THREE.AmbientLight(0x4444ff, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 3, 15);
    pointLight1.position.set(-4, 3, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 3, 15);
    pointLight2.position.set(4, 3, -2);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffff00, 2, 12);
    pointLight3.position.set(0, 5, 4);
    scene.add(pointLight3);

    // Particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 300;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 15 - 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      const color = new THREE.Color();
      color.setHSL(Math.random(), 1, 0.7);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Mouse interaction
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation
    const clock = new THREE.Clock();
    let animationId;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      crystalsRef.current.forEach((crystal) => {
        const data = crystal.userData;
        
        crystal.position.y = data.originalY + Math.sin(elapsed * data.floatSpeed + data.floatOffset) * 0.3;
        crystal.rotation.y += data.rotationSpeed * 0.01;
        crystal.rotation.x = Math.sin(elapsed * 0.5 + data.floatOffset) * 0.1;
        
        const distanceFromMouse = Math.sqrt(
          Math.pow(mouseRef.current.x * 5 - crystal.position.x, 2) +
          Math.pow(mouseRef.current.y * 5 - crystal.position.z, 2)
        );
        
        const influence = Math.max(0, 1 - distanceFromMouse / 5);
        crystal.scale.setScalar(crystal.scale.x + influence * 0.01);
      });

      particles.rotation.y += 0.0002;
      
      pointLight1.position.x = Math.sin(elapsed * 0.7) * 5;
      pointLight1.position.z = Math.cos(elapsed * 0.7) * 5;
      
      pointLight2.position.x = Math.cos(elapsed * 0.5) * 5;
      pointLight2.position.z = Math.sin(elapsed * 0.5) * 5;

      camera.position.x += (mouseRef.current.x * 2 - camera.position.x) * 0.02;
      camera.position.y += (-mouseRef.current.y + 2 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

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
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      crystalsRef.current.forEach(crystal => {
        crystal.geometry.dispose();
        crystal.material.dispose();
      });
      groundGeometry.dispose();
      groundMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-black relative overflow-hidden">
      <div ref={containerRef} className="w-full h-screen" />
      
      <div className="absolute top-0 left-0 right-0 p-12 text-center pointer-events-none z-10">
        <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4">
          CRYSTAL STRUCTURES
        </h1>
        <p className="text-xl text-cyan-300 font-light tracking-wide">
          Low-poly diamonds refracting prismatic light
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 pointer-events-none z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20">
            <div className="text-cyan-400 text-sm font-semibold mb-2">REFRACTION</div>
            <div className="text-white/80 text-xs">Light bends through crystal surfaces</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-purple-500/20">
            <div className="text-purple-400 text-sm font-semibold mb-2">LOW-POLY</div>
            <div className="text-white/80 text-xs">Geometric faceted design</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-pink-500/20">
            <div className="text-pink-400 text-sm font-semibold mb-2">INTERACTIVE</div>
            <div className="text-white/80 text-xs">Mouse movement affects crystals</div>
          </div>
        </div>
      </div>
    </div>
  );
}
