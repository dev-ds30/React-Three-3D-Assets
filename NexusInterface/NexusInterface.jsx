import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

export default function FuturisticUX() {
  const mountRef = useRef(null);
  const [activePanel, setActivePanel] = useState('home');
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const objectsRef = useRef([]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8e4dd);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 8;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(-5, 3, -5);
    scene.add(rimLight);

    const mainGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const mainMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      metalness: 0.1,
      roughness: 0.2,
    });
    const mainSphere = new THREE.Mesh(mainGeometry, mainMaterial);
    mainSphere.castShadow = true;
    scene.add(mainSphere);
    objectsRef.current.push(mainSphere);

    const ringGeometry = new THREE.TorusGeometry(1.8, 0.05, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.4,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    objectsRef.current.push(ring);

    const accentGeometry = new THREE.SphereGeometry(1.52, 64, 64, 0, Math.PI);
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.1,
    });
    const accentSphere = new THREE.Mesh(accentGeometry, accentMaterial);
    accentSphere.rotation.y = Math.PI / 2;
    scene.add(accentSphere);
    objectsRef.current.push(accentSphere);

    const centerGeometry = new THREE.TorusGeometry(0.5, 0.05, 16, 100);
    const centerRing = new THREE.Mesh(centerGeometry, ringMaterial);
    scene.add(centerRing);
    objectsRef.current.push(centerRing);

    const smallSpheres = [];
    for (let i = 0; i < 3; i++) {
      const smallGeo = new THREE.SphereGeometry(0.15, 32, 32);
      const smallMat = new THREE.MeshStandardMaterial({
        color: 0xe0e0e0,
        metalness: 0.2,
        roughness: 0.3,
      });
      const smallSphere = new THREE.Mesh(smallGeo, smallMat);
      const angle = (i / 3) * Math.PI * 2;
      smallSphere.position.x = Math.cos(angle) * 3;
      smallSphere.position.y = Math.sin(angle) * 3;
      smallSphere.position.z = -2;
      scene.add(smallSphere);
      smallSpheres.push(smallSphere);
    }

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      mainSphere.rotation.y += 0.002;
      accentSphere.rotation.y += 0.002;
      ring.rotation.z += 0.001;
      centerRing.rotation.x += 0.003;
      centerRing.rotation.y += 0.002;

      smallSpheres.forEach((sphere, i) => {
        const time = Date.now() * 0.001;
        sphere.position.y += Math.sin(time + i) * 0.002;
      });

      scene.rotation.x = rotation.x * 0.0005;
      scene.rotation.y = rotation.y * 0.0005;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [rotation]);

  const handleMouseMove = (e) => {
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    setRotation({ x: y * 100, y: x * 100 });
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-neutral-200 to-neutral-300 overflow-hidden">
      <div
        ref={mountRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
      />
      
      <div className="absolute top-8 left-8 space-y-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
          <h1 className="text-xl font-light tracking-wide text-neutral-800">NEXUS INTERFACE</h1>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 space-y-3">
        {['home', 'explore', 'settings'].map((panel) => (
          <button
            key={panel}
            onClick={() => setActivePanel(panel)}
            className={`block w-48 px-6 py-3 rounded-full transition-all duration-300 ${
              activePanel === panel
                ? 'bg-neutral-900 text-white shadow-xl'
                : 'bg-white/60 backdrop-blur-sm text-neutral-700 hover:bg-white/80'
            }`}
          >
            <span className="font-light tracking-wide uppercase text-sm">
              {panel}
            </span>
          </button>
        ))}
      </div>

      <div className="absolute top-8 right-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg max-w-xs">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-light text-neutral-600">STATUS</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-500">SYSTEM</span>
              <span className="text-neutral-800 font-medium">ACTIVE</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-500">MODE</span>
              <span className="text-neutral-800 font-medium">{activePanel.toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-500">RENDER</span>
              <span className="text-neutral-800 font-medium">60 FPS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 text-xs text-neutral-500 font-light">
        INTERACTIVE 3D EXPERIENCE
      </div>
    </div>
  );
}
