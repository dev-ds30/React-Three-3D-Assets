import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GlassChromeShapes() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    // Create enhanced environment map
    const createEnvironmentMap = () => {
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Vibrant gradient background
      const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      gradient.addColorStop(0, '#ff006e');
      gradient.addColorStop(0.3, '#8338ec');
      gradient.addColorStop(0.6, '#3a86ff');
      gradient.addColorStop(1, '#06ffa5');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Add bright highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 40 + 20;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.mapping = THREE.EquirectangularReflectionMapping;
      return texture;
    };

    const envMap = createEnvironmentMap();

    // Ultra chrome material
    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.05,
      envMap: envMap,
      envMapIntensity: 3.0
    });

    // Crystal clear glass
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0,
      transmission: 1.0,
      thickness: 1.0,
      envMap: envMap,
      envMapIntensity: 2.0,
      transparent: true,
      ior: 1.5,
      reflectivity: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0
    });

    // Colored glass material
    const coloredGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x00ffaa,
      metalness: 0,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.8,
      envMap: envMap,
      envMapIntensity: 1.8,
      transparent: true,
      ior: 1.6,
      reflectivity: 0.7
    });

    // Rose gold chrome
    const roseGoldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffb6c1,
      metalness: 1.0,
      roughness: 0.1,
      envMap: envMap,
      envMapIntensity: 2.5
    });

    // Create main shapes
    // Center chrome sphere
    const sphereGeo = new THREE.SphereGeometry(1.2, 128, 128);
    const chromeSphere = new THREE.Mesh(sphereGeo, chromeMaterial);
    chromeSphere.position.set(0, 1.2, 0);
    chromeSphere.castShadow = true;
    scene.add(chromeSphere);

    // Glass cube left
    const cubeGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8, 32, 32, 32);
    const glassCube = new THREE.Mesh(cubeGeo, glassMaterial);
    glassCube.position.set(-3.5, 1.8, 0);
    glassCube.castShadow = true;
    scene.add(glassCube);

    // Chrome torus right
    const torusGeo = new THREE.TorusGeometry(1.2, 0.5, 64, 128);
    const chromeTorus = new THREE.Mesh(torusGeo, roseGoldMaterial);
    chromeTorus.position.set(3.5, 1.2, 0);
    chromeTorus.rotation.x = Math.PI / 4;
    chromeTorus.castShadow = true;
    scene.add(chromeTorus);

    // Small colored glass spheres orbiting
    const smallSphereGeo = new THREE.SphereGeometry(0.4, 64, 64);
    const orbitSpheres = [];
    for (let i = 0; i < 5; i++) {
      const mat = coloredGlassMaterial.clone();
      mat.color.setHSL(i / 5, 1, 0.5);
      const sphere = new THREE.Mesh(smallSphereGeo, mat);
      sphere.castShadow = true;
      orbitSpheres.push(sphere);
      scene.add(sphere);
    }

    // Chrome octahedron
    const octaGeo = new THREE.OctahedronGeometry(0.8, 0);
    const chromeOcta = new THREE.Mesh(octaGeo, chromeMaterial.clone());
    chromeOcta.position.set(0, 3.5, -2);
    chromeOcta.castShadow = true;
    scene.add(chromeOcta);

    // Mirror floor
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111122,
      metalness: 0.9,
      roughness: 0.1,
      envMap: envMap,
      envMapIntensity: 1.0
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(10, 15, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -15;
    scene.add(mainLight);

    // Colored accent lights
    const light1 = new THREE.PointLight(0xff006e, 3, 25);
    light1.position.set(0, 4, 0);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x00f5ff, 3, 25);
    light2.position.set(5, 3, 5);
    scene.add(light2);

    const light3 = new THREE.PointLight(0x7c3aed, 3, 25);
    light3.position.set(-5, 3, -5);
    scene.add(light3);

    // Camera
    camera.position.set(6, 6, 8);
    camera.lookAt(0, 1, 0);

    // Animation
    let time = 0;
    
    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      // Rotate main shapes
      chromeSphere.rotation.y += 0.008;
      glassCube.rotation.x += 0.004;
      glassCube.rotation.y += 0.006;
      chromeTorus.rotation.z += 0.005;
      chromeTorus.rotation.y += 0.003;
      chromeOcta.rotation.x += 0.01;
      chromeOcta.rotation.y += 0.007;

      // Orbit small spheres
      orbitSpheres.forEach((sphere, i) => {
        const angle = (time * 0.5) + (i * Math.PI * 2 / 5);
        const radius = 2.5;
        sphere.position.x = Math.cos(angle) * radius;
        sphere.position.z = Math.sin(angle) * radius;
        sphere.position.y = 1.2 + Math.sin(time * 2 + i) * 0.3;
        sphere.rotation.y += 0.02;
      });

      // Animate lights
      light1.position.x = Math.sin(time * 0.7) * 6;
      light1.position.z = Math.cos(time * 0.7) * 6;

      light2.position.x = Math.cos(time * 0.5) * 7;
      light2.position.z = Math.sin(time * 0.5) * 7;

      light3.position.x = Math.sin(time * 0.6 + Math.PI) * 6;
      light3.position.z = Math.cos(time * 0.6 + Math.PI) * 6;

      // Gentle camera orbit
      const cameraRadius = 10;
      camera.position.x = Math.sin(time * 0.12) * cameraRadius;
      camera.position.z = Math.cos(time * 0.12) * cameraRadius;
      camera.lookAt(0, 1.5, 0);

      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height: '100vh', margin: 0 }} />
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        textShadow: '0 0 20px rgba(255, 0, 110, 0.8)',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '15px 25px',
        borderRadius: '10px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '600' }}>
          Glass & Chrome Materials
        </div>
        <div style={{ opacity: 0.85, fontSize: '12px' }}>
          PBR Materials • Environment Mapping • Real-time Reflections
        </div>
      </div>
    </div>
  );
}
