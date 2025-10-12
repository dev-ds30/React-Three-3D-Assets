import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export default function Glowing3DHorse() {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Create gradient background
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#000033');
    gradient.addColorStop(1, '#1a0066');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    const bgTexture = new THREE.CanvasTexture(canvas);
    scene.background = bgTexture;

    // Horse geometry - creating a stylized rearing horse
    const horseGroup = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.2, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0xff6600,
      emissive: 0xff3300,
      emissiveIntensity: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.9
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = Math.PI / 6;
    body.position.y = 0.5;
    horseGroup.add(body);

    // Neck
    const neckGeometry = new THREE.CylinderGeometry(0.25, 0.35, 1.0, 8);
    const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
    neck.position.set(0.3, 1.3, 0);
    neck.rotation.z = -Math.PI / 3;
    horseGroup.add(neck);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.35, 8, 8);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0.1, 2.1, 0);
    head.scale.set(1, 1.3, 0.8);
    horseGroup.add(head);

    // Snout
    const snoutGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.4, 8);
    const snout = new THREE.Mesh(snoutGeometry, bodyMaterial);
    snout.position.set(-0.1, 1.9, 0.2);
    snout.rotation.x = Math.PI / 2;
    horseGroup.add(snout);

    // Mane
    for (let i = 0; i < 5; i++) {
      const maneGeometry = new THREE.SphereGeometry(0.15, 6, 6);
      const maneMaterial = new THREE.MeshPhongMaterial({
        color: 0xffaa00,
        emissive: 0xff6600,
        emissiveIntensity: 1.2,
        wireframe: true,
        transparent: true,
        opacity: 0.7
      });
      const mane = new THREE.Mesh(maneGeometry, maneMaterial);
      mane.position.set(0.3 - i * 0.15, 2.0 - i * 0.2, -0.2);
      horseGroup.add(mane);
    }

    // Front legs (raised)
    const legGeometry = new THREE.CylinderGeometry(0.12, 0.1, 0.9, 6);
    
    const frontLeg1 = new THREE.Mesh(legGeometry, bodyMaterial);
    frontLeg1.position.set(0.5, 0.8, 0.2);
    frontLeg1.rotation.z = -Math.PI / 4;
    horseGroup.add(frontLeg1);

    const frontLeg2 = new THREE.Mesh(legGeometry, bodyMaterial);
    frontLeg2.position.set(0.5, 0.7, -0.2);
    frontLeg2.rotation.z = -Math.PI / 5;
    horseGroup.add(frontLeg2);

    // Back legs
    const backLeg1 = new THREE.Mesh(legGeometry, bodyMaterial);
    backLeg1.position.set(-0.3, -0.2, 0.2);
    backLeg1.rotation.z = Math.PI / 12;
    horseGroup.add(backLeg1);

    const backLeg2 = new THREE.Mesh(legGeometry, bodyMaterial);
    backLeg2.position.set(-0.3, -0.2, -0.2);
    backLeg2.rotation.z = Math.PI / 12;
    horseGroup.add(backLeg2);

    // Hooves
    for (let i = 0; i < 4; i++) {
      const hoofGeometry = new THREE.SphereGeometry(0.12, 6, 6);
      const hoof = new THREE.Mesh(hoofGeometry, bodyMaterial);
      if (i < 2) {
        hoof.position.set(0.9 - i * 0.05, 0.4 + i * 0.1, 0.2 - i * 0.4);
      } else {
        hoof.position.set(-0.5, -0.7, 0.2 - (i - 2) * 0.4);
      }
      horseGroup.add(hoof);
    }

    // Tail
    for (let i = 0; i < 4; i++) {
      const tailGeometry = new THREE.SphereGeometry(0.12 - i * 0.02, 6, 6);
      const tailMaterial = new THREE.MeshPhongMaterial({
        color: 0xff8800,
        emissive: 0xff4400,
        emissiveIntensity: 1.0,
        wireframe: true,
        transparent: true,
        opacity: 0.8 - i * 0.15
      });
      const tail = new THREE.Mesh(tailGeometry, tailMaterial);
      tail.position.set(-0.6 - i * 0.15, 0.3 - i * 0.2, 0);
      horseGroup.add(tail);
    }

    // Add glow particles
    const particleCount = 100;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 4;
      positions[i + 1] = (Math.random() - 0.5) * 4;
      positions[i + 2] = (Math.random() - 0.5) * 2;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffaa00,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    scene.add(horseGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff6600, 2, 10);
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00aaff, 1.5, 10);
    pointLight2.position.set(-2, 1, -2);
    scene.add(pointLight2);

    camera.position.z = 5;
    camera.position.y = 1;

    setLoading(false);

    // Animation
    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      // Rotate horse group
      horseGroup.rotation.y = Math.sin(time * 0.5) * 0.3;
      horseGroup.position.y = Math.sin(time) * 0.1;

      // Animate particles
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time + i) * 0.01;
        if (positions[i + 1] > 2) positions[i + 1] = -2;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y += 0.001;

      // Pulse glow effect
      const pulseIntensity = 0.8 + Math.sin(time * 2) * 0.3;
      horseGroup.children.forEach(child => {
        if (child.material) {
          child.material.emissiveIntensity = pulseIntensity;
        }
      });

      renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-gray-900 to-blue-900">
      <div ref={containerRef} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-orange-400 text-xl font-light">Loading...</div>
        </div>
      )}
    </div>
  );
}
