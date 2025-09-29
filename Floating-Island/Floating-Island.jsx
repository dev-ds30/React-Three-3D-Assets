import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FloatingIsland() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 20, 100);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Create island base (cone shape)
    const islandGeometry = new THREE.ConeGeometry(5, 3, 8);
    const islandMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      flatShading: true
    });
    const island = new THREE.Mesh(islandGeometry, islandMaterial);
    island.position.y = -1;
    island.castShadow = true;
    island.receiveShadow = true;
    scene.add(island);

    // Create grass top
    const grassGeometry = new THREE.CylinderGeometry(5, 5, 0.5, 8);
    const grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d8c40,
      flatShading: true
    });
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.position.y = 0.5;
    grass.castShadow = true;
    grass.receiveShadow = true;
    scene.add(grass);

    // Create trees
    function createTree(x, z) {
      const group = new THREE.Group();

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 1, 6);
      const trunkMat = new THREE.MeshStandardMaterial({
        color: 0x654321,
        flatShading: true
      });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.5;
      trunk.castShadow = true;
      group.add(trunk);

      // Foliage (3 levels)
      const foliageMat = new THREE.MeshStandardMaterial({
        color: 0x2d5016,
        flatShading: true
      });

      const foliage1 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 6), foliageMat);
      foliage1.position.y = 1.4;
      foliage1.castShadow = true;
      group.add(foliage1);

      const foliage2 = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1, 6), foliageMat);
      foliage2.position.y = 2;
      foliage2.castShadow = true;
      group.add(foliage2);

      const foliage3 = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.8, 6), foliageMat);
      foliage3.position.y = 2.5;
      foliage3.castShadow = true;
      group.add(foliage3);

      group.position.set(x, 0.75, z);
      return group;
    }

    // Add trees
    const tree1 = createTree(1.5, 1);
    const tree2 = createTree(-1.8, 0.5);
    const tree3 = createTree(0.5, -1.5);
    const tree4 = createTree(-0.8, -1.8);
    const tree5 = createTree(2.2, -0.5);
    scene.add(tree1, tree2, tree3, tree4, tree5);

    // Create water plane with shader
    const waterGeometry = new THREE.PlaneGeometry(100, 100, 128, 128);
    
    const waterVertexShader = `
      uniform float uTime;
      varying vec2 vUv;
      varying float vElevation;
      
      void main() {
        vUv = uv;
        
        vec3 pos = position;
        float wave1 = sin(pos.x * 0.5 + uTime) * 0.3;
        float wave2 = sin(pos.y * 0.3 + uTime * 1.2) * 0.2;
        pos.z += wave1 + wave2;
        
        vElevation = pos.z;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const waterFragmentShader = `
      uniform float uTime;
      varying vec2 vUv;
      varying float vElevation;
      
      void main() {
        vec3 waterColor = vec3(0.1, 0.4, 0.7);
        vec3 foamColor = vec3(0.8, 0.9, 1.0);
        
        float mixStrength = vElevation * 2.0;
        vec3 color = mix(waterColor, foamColor, mixStrength);
        
        // Add shimmer
        float shimmer = sin(vUv.x * 50.0 + uTime * 2.0) * sin(vUv.y * 50.0 + uTime * 2.0);
        color += shimmer * 0.1;
        
        gl_FragColor = vec4(color, 0.8);
      }
    `;

    const waterMaterial = new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      uniforms: {
        uTime: { value: 0 }
      },
      transparent: true,
      side: THREE.DoubleSide
    });

    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -5;
    scene.add(water);

    // Create clouds
    function createCloud(x, y, z) {
      const group = new THREE.Group();
      const cloudMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        flatShading: true,
        transparent: true,
        opacity: 0.8
      });

      for (let i = 0; i < 5; i++) {
        const size = Math.random() * 0.5 + 0.5;
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(size, 6, 6),
          cloudMaterial
        );
        sphere.position.set(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 1
        );
        group.add(sphere);
      }

      group.position.set(x, y, z);
      return group;
    }

    // Add clouds
    const clouds = [];
    for (let i = 0; i < 8; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = Math.random() * 5 + 5;
      const z = (Math.random() - 0.5) * 40;
      const cloud = createCloud(x, y, z);
      clouds.push(cloud);
      scene.add(cloud);
    }

    // Add rocks on island
    function createRock(x, z, scale) {
      const rockGeo = new THREE.DodecahedronGeometry(0.3 * scale, 0);
      const rockMat = new THREE.MeshStandardMaterial({
        color: 0x808080,
        flatShading: true
      });
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(x, 0.9, z);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      return rock;
    }

    const rock1 = createRock(-2.5, 1.5, 1);
    const rock2 = createRock(2.8, 0.8, 0.8);
    const rock3 = createRock(-1, -2.5, 1.2);
    const rock4 = createRock(1, 2, 0.6);
    scene.add(rock1, rock2, rock3, rock4);

    // Add small bushes
    function createBush(x, z) {
      const bushGeo = new THREE.SphereGeometry(0.3, 6, 6);
      const bushMat = new THREE.MeshStandardMaterial({
        color: 0x4a7c4e,
        flatShading: true
      });
      const bush = new THREE.Mesh(bushGeo, bushMat);
      bush.position.set(x, 0.85, z);
      bush.scale.set(1, 0.8, 1);
      bush.castShadow = true;
      return bush;
    }

    const bush1 = createBush(3, -1.5);
    const bush2 = createBush(-2.8, -1.2);
    const bush3 = createBush(0, 2.5);
    scene.add(bush1, bush2, bush3);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add rim light
    const rimLight = new THREE.DirectionalLight(0x9bd4ff, 0.5);
    rimLight.position.set(-10, 5, -10);
    scene.add(rimLight);

    // Camera position
    camera.position.set(8, 6, 12);
    camera.lookAt(0, 0, 0);

    // Animation
    let time = 0;
    
    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      // Update water shader
      waterMaterial.uniforms.uTime.value = time;

      // Float island
      island.position.y = -1 + Math.sin(time * 0.5) * 0.2;
      grass.position.y = 0.5 + Math.sin(time * 0.5) * 0.2;
      
      // Trees float with island
      [tree1, tree2, tree3, tree4, tree5].forEach(tree => {
        tree.position.y = 0.75 + Math.sin(time * 0.5) * 0.2;
      });

      // Rocks float with island
      [rock1, rock2, rock3, rock4].forEach(rock => {
        rock.position.y = 0.9 + Math.sin(time * 0.5) * 0.2;
      });

      // Bushes float with island
      [bush1, bush2, bush3].forEach(bush => {
        bush.position.y = 0.85 + Math.sin(time * 0.5) * 0.2;
      });

      // Rotate island slowly
      island.rotation.y += 0.001;
      grass.rotation.y += 0.001;

      // Drift clouds
      clouds.forEach((cloud, i) => {
        cloud.position.x += Math.sin(time * 0.1 + i) * 0.01;
        cloud.position.z += Math.cos(time * 0.1 + i) * 0.01;
        
        // Wrap around
        if (cloud.position.x > 30) cloud.position.x = -30;
        if (cloud.position.x < -30) cloud.position.x = 30;
        if (cloud.position.z > 30) cloud.position.z = -30;
        if (cloud.position.z < -30) cloud.position.z = 30;
      });

      // Orbit camera
      const radius = 15;
      camera.position.x = Math.sin(time * 0.1) * radius;
      camera.position.z = Math.cos(time * 0.1) * radius;
      camera.position.y = 6 + Math.sin(time * 0.05) * 2;
      camera.lookAt(0, 0, 0);

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
        top: '20px',
        right: '20px',
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        textAlign: 'right',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '12px 20px',
        borderRadius: '10px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ fontSize: '16px', marginBottom: '6px', fontWeight: '600' }}>
          🏝️ Floating Island
        </div>
        <div style={{ opacity: 0.85, fontSize: '11px', lineHeight: '1.5' }}>
          Low-poly style<br/>
          Animated water shader<br/>
          Drifting clouds<br/>
          Trees, rocks & bushes
        </div>
      </div>
    </div>
  );
}
