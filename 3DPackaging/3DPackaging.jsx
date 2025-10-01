import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export default function PackagingMockups() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const productsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [activeProduct, setActiveProduct] = useState('box');
  const [selectedTexture, setSelectedTexture] = useState('gradient');

  const textures = {
    gradient: { name: 'Gradient', color1: 0xff6b9d, color2: 0xc471ed },
    ocean: { name: 'Ocean', color1: 0x00d4ff, color2: 0x0066ff },
    sunset: { name: 'Sunset', color1: 0xff6f00, color2: 0xff0844 },
    forest: { name: 'Forest', color1: 0x11998e, color2: 0x38ef7d },
    purple: { name: 'Purple', color1: 0x6a3093, color2: 0xa044ff },
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);

    // Create gradient texture
    const createGradientTexture = (color1, color2) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      const c1 = new THREE.Color(color1);
      const c2 = new THREE.Color(color2);
      gradient.addColorStop(0, `rgb(${c1.r * 255}, ${c1.g * 255}, ${c1.b * 255})`);
      gradient.addColorStop(1, `rgb(${c2.r * 255}, ${c2.g * 255}, ${c2.b * 255})`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    // Create label texture
    const createLabelTexture = (text) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 512, 512);
      
      ctx.fillStyle = '#333';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 256, 200);
      
      ctx.font = '24px Arial';
      ctx.fillText('PREMIUM QUALITY', 256, 280);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    // Box packaging
    const createBox = (gradientTexture) => {
      const boxGroup = new THREE.Group();
      
      const boxGeometry = new THREE.BoxGeometry(2.5, 3.5, 2.5, 32, 32, 32);
      const boxMaterials = [
        new THREE.MeshStandardMaterial({ map: gradientTexture, metalness: 0.3, roughness: 0.4 }),
        new THREE.MeshStandardMaterial({ map: gradientTexture, metalness: 0.3, roughness: 0.4 }),
        new THREE.MeshStandardMaterial({ map: gradientTexture, metalness: 0.3, roughness: 0.4 }),
        new THREE.MeshStandardMaterial({ map: gradientTexture, metalness: 0.3, roughness: 0.4 }),
        new THREE.MeshStandardMaterial({ map: createLabelTexture('BRAND'), metalness: 0.1, roughness: 0.6 }),
        new THREE.MeshStandardMaterial({ map: gradientTexture, metalness: 0.3, roughness: 0.4 }),
      ];
      
      const box = new THREE.Mesh(boxGeometry, boxMaterials);
      box.castShadow = true;
      box.receiveShadow = true;
      boxGroup.add(box);
      
      const edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      boxGroup.add(edges);
      
      return boxGroup;
    };

    // Bottle packaging
    const createBottle = (gradientTexture) => {
      const bottleGroup = new THREE.Group();
      
      const bodyGeometry = new THREE.CylinderGeometry(0.8, 1, 4, 32);
      const bodyMaterial = new THREE.MeshPhysicalMaterial({
        map: gradientTexture,
        metalness: 0.2,
        roughness: 0.3,
        transmission: 0.1,
        transparent: true,
        opacity: 0.95,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.castShadow = true;
      bottleGroup.add(body);
      
      const neckGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1, 32);
      const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
      neck.position.y = 2.5;
      bottleGroup.add(neck);
      
      const capGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32);
      const capMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 });
      const cap = new THREE.Mesh(capGeometry, capMaterial);
      cap.position.y = 3.25;
      cap.castShadow = true;
      bottleGroup.add(cap);
      
      const labelGeometry = new THREE.CylinderGeometry(1.02, 1.22, 2, 32, 1, true);
      const labelMaterial = new THREE.MeshStandardMaterial({
        map: createLabelTexture('PREMIUM'),
        transparent: true,
        metalness: 0.1,
        roughness: 0.8,
      });
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.y = 0.5;
      bottleGroup.add(label);
      
      return bottleGroup;
    };

    // Bag packaging
    const createBag = (gradientTexture) => {
      const bagGroup = new THREE.Group();
      
      const shape = new THREE.Shape();
      shape.moveTo(-1.5, -2);
      shape.lineTo(-1.5, 2);
      shape.quadraticCurveTo(-1.5, 2.5, -1, 2.5);
      shape.lineTo(1, 2.5);
      shape.quadraticCurveTo(1.5, 2.5, 1.5, 2);
      shape.lineTo(1.5, -2);
      shape.quadraticCurveTo(1.5, -2.5, 1, -2.5);
      shape.lineTo(-1, -2.5);
      shape.quadraticCurveTo(-1.5, -2.5, -1.5, -2);
      
      const extrudeSettings = {
        steps: 2,
        depth: 1,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 5
      };
      
      const bagGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const bagMaterial = new THREE.MeshStandardMaterial({
        map: gradientTexture,
        metalness: 0.1,
        roughness: 0.6,
      });
      const bag = new THREE.Mesh(bagGeometry, bagMaterial);
      bag.castShadow = true;
      bagGroup.add(bag);
      
      const logoGeometry = new THREE.PlaneGeometry(1.5, 1.5);
      const logoMaterial = new THREE.MeshStandardMaterial({
        map: createLabelTexture('LOGO'),
        transparent: true,
        metalness: 0.1,
        roughness: 0.8,
      });
      const logo = new THREE.Mesh(logoGeometry, logoMaterial);
      logo.position.set(0, 0.5, 1.15);
      bagGroup.add(logo);
      
      return bagGroup;
    };

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xaaccff, 0.5);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(-3, 3, -8);
    scene.add(rimLight);

    // Ground with shadow
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.15 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    ground.receiveShadow = true;
    scene.add(ground);

    // Background elements
    const bgCircleGeometry = new THREE.CircleGeometry(8, 64);
    const bgCircleMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xe0e0e0, 
      transparent: true, 
      opacity: 0.3 
    });
    const bgCircle = new THREE.Mesh(bgCircleGeometry, bgCircleMaterial);
    bgCircle.position.z = -5;
    scene.add(bgCircle);

    // Create initial product
    let currentProduct;
    const updateProduct = (type, textureKey) => {
      if (currentProduct) {
        scene.remove(currentProduct);
        currentProduct.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }

      const textureData = textures[textureKey];
      const gradientTexture = createGradientTexture(textureData.color1, textureData.color2);

      switch(type) {
        case 'box':
          currentProduct = createBox(gradientTexture);
          break;
        case 'bottle':
          currentProduct = createBottle(gradientTexture);
          break;
        case 'bag':
          currentProduct = createBag(gradientTexture);
          break;
        default:
          currentProduct = createBox(gradientTexture);
      }

      scene.add(currentProduct);
      productsRef.current = [currentProduct];
    };

    updateProduct(activeProduct, selectedTexture);

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

      if (currentProduct) {
        currentProduct.position.y = Math.sin(elapsed * 0.8) * 0.3;
        currentProduct.rotation.y = elapsed * 0.3;
        currentProduct.rotation.x = Math.sin(elapsed * 0.5) * 0.05;
      }

      camera.position.x += (mouseRef.current.x * 2 - camera.position.x) * 0.05;
      camera.position.y += (-mouseRef.current.y * 2 + 3 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      bgCircle.rotation.z = elapsed * 0.1;

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
      if (currentProduct) {
        currentProduct.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
      groundGeometry.dispose();
      groundMaterial.dispose();
      bgCircleGeometry.dispose();
      bgCircleMaterial.dispose();
      renderer.dispose();
    };
  }, [activeProduct, selectedTexture]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="relative w-full h-screen">
        <div ref={containerRef} className="w-full h-full" />
        
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center z-10">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">3D Packaging Mockups</h1>
          <p className="text-gray-600">Customize your product packaging in real-time</p>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-6">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200">
            <div className="text-sm font-semibold text-gray-700 mb-3">PRODUCT TYPE</div>
            <div className="flex gap-3">
              {[
                { id: 'box', label: 'Box', icon: '📦' },
                { id: 'bottle', label: 'Bottle', icon: '🍾' },
                { id: 'bag', label: 'Bag', icon: '👜' }
              ].map(product => (
                <button
                  key={product.id}
                  onClick={() => setActiveProduct(product.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    activeProduct === product.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{product.icon}</span>
                  {product.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200">
            <div className="text-sm font-semibold text-gray-700 mb-3">COLOR THEME</div>
            <div className="flex gap-3">
              {Object.entries(textures).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTexture(key)}
                  className={`px-5 py-3 rounded-xl font-medium transition-all ${
                    selectedTexture === key
                      ? 'ring-4 ring-purple-500 scale-105'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, #${value.color1.toString(16).padStart(6, '0')}, #${value.color2.toString(16).padStart(6, '0')})`,
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  {value.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
