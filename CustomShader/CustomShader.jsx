import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function CustomShaders() {
  const mountRef = useRef(null);
  const [selectedShader, setSelectedShader] = useState('lava');

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lava Shader
    const lavaVertexShader = `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        
        vec3 pos = position;
        
        // Add wave distortion
        float wave = sin(pos.x * 2.0 + uTime) * 0.1;
        wave += sin(pos.y * 3.0 + uTime * 1.5) * 0.05;
        pos.z += wave;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const lavaFragmentShader = `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vec2 uv = vUv;
        
        // Flowing lava pattern
        float pattern1 = sin(uv.x * 10.0 + uTime * 2.0) * sin(uv.y * 10.0 + uTime * 1.5);
        float pattern2 = sin(uv.x * 5.0 - uTime * 3.0) * sin(uv.y * 5.0 + uTime * 2.0);
        
        float noise = pattern1 * 0.5 + pattern2 * 0.5;
        
        // Color gradient from dark red to bright yellow
        vec3 color1 = vec3(0.2, 0.0, 0.0); // Dark red
        vec3 color2 = vec3(1.0, 0.3, 0.0); // Orange
        vec3 color3 = vec3(1.0, 1.0, 0.0); // Yellow
        
        float t = (noise + 1.0) * 0.5;
        vec3 color = mix(color1, color2, t);
        color = mix(color, color3, pow(t, 3.0));
        
        // Add glow
        color += vec3(0.3, 0.1, 0.0) * sin(uTime * 2.0 + uv.y * 5.0);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Holographic Shader
    const holoVertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const holoFragmentShader = `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        // Fresnel effect
        vec3 viewDirection = normalize(cameraPosition - vPosition);
        float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);
        
        // Scanlines
        float scanline = sin(vPosition.y * 20.0 + uTime * 3.0) * 0.5 + 0.5;
        
        // Color shift based on position and time
        vec3 color1 = vec3(0.0, 1.0, 1.0); // Cyan
        vec3 color2 = vec3(1.0, 0.0, 1.0); // Magenta
        
        float colorShift = sin(vPosition.y * 2.0 + uTime * 2.0) * 0.5 + 0.5;
        vec3 color = mix(color1, color2, colorShift);
        
        // Combine effects
        color *= fresnel * 2.0;
        color += scanline * 0.3;
        
        // Add transparency
        float alpha = fresnel * 0.8;
        
        gl_FragColor = vec4(color, alpha);
      }
    `;

    // Glitch Shader
    const glitchVertexShader = `
      uniform float uTime;
      uniform float uGlitchIntensity;
      varying vec2 vUv;
      
      // Random function
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      
      void main() {
        vUv = uv;
        vec3 pos = position;
        
        // Random glitch offset
        float glitch = random(vec2(floor(uTime * 10.0), 0.0));
        if (glitch > 0.95) {
          float offset = (random(vec2(uTime, position.y)) - 0.5) * uGlitchIntensity;
          pos.x += offset;
        }
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const glitchFragmentShader = `
      uniform float uTime;
      uniform sampler2D uTexture;
      varying vec2 vUv;
      
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      
      void main() {
        vec2 uv = vUv;
        
        // RGB shift
        float glitch = random(vec2(floor(uTime * 10.0), 0.0));
        float shift = 0.0;
        
        if (glitch > 0.9) {
          shift = (random(vec2(uTime, uv.y)) - 0.5) * 0.1;
        }
        
        float r = sin(uv.x * 10.0 + uTime * 2.0) * 0.5 + 0.5;
        float g = sin(uv.x * 10.0 + shift + uTime * 2.0) * 0.5 + 0.5;
        float b = sin(uv.x * 10.0 - shift + uTime * 2.0) * 0.5 + 0.5;
        
        vec3 color = vec3(r, g, b);
        
        // Horizontal glitch lines
        float lineGlitch = random(vec2(floor(uv.y * 100.0), floor(uTime * 5.0)));
        if (lineGlitch > 0.95) {
          color = vec3(1.0);
        }
        
        // Color corruption
        if (glitch > 0.95) {
          color.r = random(uv + uTime);
          color.g = random(uv - uTime);
          color.b = random(uv * uTime);
        }
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Water Shader
    const waterVertexShader = `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        
        vec3 pos = position;
        
        // Wave animation
        float wave1 = sin(pos.x * 2.0 + uTime * 2.0) * 0.2;
        float wave2 = sin(pos.z * 2.0 + uTime * 1.5) * 0.15;
        pos.y += wave1 + wave2;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const waterFragmentShader = `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        // Fresnel for transparency at edges
        vec3 viewDirection = normalize(cameraPosition - vPosition);
        float fresnel = pow(1.0 - dot(viewDirection, vNormal), 2.0);
        
        // Animated water color
        vec3 shallowColor = vec3(0.0, 0.7, 0.9);
        vec3 deepColor = vec3(0.0, 0.2, 0.5);
        
        float depth = sin(vUv.x * 5.0 + uTime) * sin(vUv.y * 5.0 + uTime * 1.3);
        vec3 color = mix(deepColor, shallowColor, depth * 0.5 + 0.5);
        
        // Add foam
        float foam = step(0.8, sin(vUv.x * 20.0 + uTime * 3.0) * sin(vUv.y * 20.0 + uTime * 2.5));
        color = mix(color, vec3(1.0), foam * 0.5);
        
        // Apply fresnel
        color += fresnel * 0.3;
        
        gl_FragColor = vec4(color, 0.8 + fresnel * 0.2);
      }
    `;

    // Energy Shield Shader
    const shieldVertexShader = `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        
        vec3 pos = position;
        
        // Pulse effect
        float pulse = sin(uTime * 2.0) * 0.05;
        pos *= 1.0 + pulse;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const shieldFragmentShader = `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vec3 viewDirection = normalize(cameraPosition - vPosition);
        float fresnel = pow(1.0 - dot(viewDirection, vNormal), 4.0);
        
        // Hexagon pattern
        vec2 uv = vPosition.xy * 3.0;
        vec2 grid = abs(fract(uv - 0.5) - 0.5) / fwidth(uv);
        float hexPattern = min(grid.x, grid.y);
        hexPattern = 1.0 - smoothstep(0.0, 1.0, hexPattern);
        
        // Energy pulses
        float pulse = sin(vPosition.y * 5.0 + uTime * 3.0) * 0.5 + 0.5;
        
        vec3 color = vec3(0.0, 0.5, 1.0);
        color += hexPattern * 0.5;
        color += pulse * 0.3;
        color *= fresnel * 3.0;
        
        float alpha = fresnel * 0.7 + hexPattern * 0.2;
        
        gl_FragColor = vec4(color, alpha);
      }
    `;

    // Create objects with different shaders
    const shaderObjects = {};

    // Lava Sphere
    const lavaGeo = new THREE.SphereGeometry(2, 64, 64);
    const lavaMat = new THREE.ShaderMaterial({
      vertexShader: lavaVertexShader,
      fragmentShader: lavaFragmentShader,
      uniforms: {
        uTime: { value: 0 }
      }
    });
    const lavaSphere = new THREE.Mesh(lavaGeo, lavaMat);
    shaderObjects.lava = lavaSphere;

    // Holographic Torus
    const holoGeo = new THREE.TorusKnotGeometry(1.5, 0.5, 128, 32);
    const holoMat = new THREE.ShaderMaterial({
      vertexShader: holoVertexShader,
      fragmentShader: holoFragmentShader,
      uniforms: {
        uTime: { value: 0 }
      },
      transparent: true,
      side: THREE.DoubleSide
    });
    const holoTorus = new THREE.Mesh(holoGeo, holoMat);
    shaderObjects.holographic = holoTorus;

    // Glitch Cube
    const glitchGeo = new THREE.BoxGeometry(3, 3, 3);
    const glitchMat = new THREE.ShaderMaterial({
      vertexShader: glitchVertexShader,
      fragmentShader: glitchFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uGlitchIntensity: { value: 1.0 }
      }
    });
    const glitchCube = new THREE.Mesh(glitchGeo, glitchMat);
    shaderObjects.glitch = glitchCube;

    // Water Plane
    const waterGeo = new THREE.PlaneGeometry(4, 4, 64, 64);
    const waterMat = new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      uniforms: {
        uTime: { value: 0 }
      },
      transparent: true,
      side: THREE.DoubleSide
    });
    const waterPlane = new THREE.Mesh(waterGeo, waterMat);
    shaderObjects.water = waterPlane;

    // Energy Shield
    const shieldGeo = new THREE.SphereGeometry(2, 32, 32);
    const shieldMat = new THREE.ShaderMaterial({
      vertexShader: shieldVertexShader,
      fragmentShader: shieldFragmentShader,
      uniforms: {
        uTime: { value: 0 }
      },
      transparent: true,
      side: THREE.DoubleSide
    });
    const shieldSphere = new THREE.Mesh(shieldGeo, shieldMat);
    shaderObjects.shield = shieldSphere;

    // Add all objects to scene but make them invisible initially
    Object.values(shaderObjects).forEach(obj => {
      obj.visible = false;
      scene.add(obj);
    });

    // Show selected shader
    shaderObjects[selectedShader].visible = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff00ff, 2, 20);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ffff, 2, 20);
    pointLight2.position.set(-5, 5, -5);
    scene.add(pointLight2);

    // Camera
    camera.position.z = 8;

    // Animation
    let time = 0;

    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      // Update all shader uniforms
      Object.values(shaderObjects).forEach(obj => {
        if (obj.material.uniforms && obj.material.uniforms.uTime) {
          obj.material.uniforms.uTime.value = time;
        }
      });

      // Rotate objects
      Object.values(shaderObjects).forEach(obj => {
        if (obj.visible) {
          obj.rotation.x += 0.005;
          obj.rotation.y += 0.01;
        }
      });

      // Animate lights
      pointLight1.position.x = Math.sin(time * 0.5) * 6;
      pointLight1.position.z = Math.cos(time * 0.5) * 6;

      pointLight2.position.x = Math.cos(time * 0.7) * 6;
      pointLight2.position.z = Math.sin(time * 0.7) * 6;

      // Orbit camera
      camera.position.x = Math.sin(time * 0.1) * 8;
      camera.position.z = Math.cos(time * 0.1) * 8;
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
  }, [selectedShader]);

  const shaders = [
    { id: 'lava', name: 'Lava', icon: '🌋', desc: 'Flowing molten lava' },
    { id: 'holographic', name: 'Holographic', icon: '✨', desc: 'Sci-fi hologram' },
    { id: 'glitch', name: 'Glitch', icon: '⚡', desc: 'Digital corruption' },
    { id: 'water', name: 'Water', icon: '🌊', desc: 'Animated waves' },
    { id: 'shield', name: 'Energy Shield', icon: '🛡️', desc: 'Force field' }
  ];

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height: '100vh', margin: 0 }} />
      
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.85)',
        padding: '20px 40px',
        borderRadius: '15px',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.3)'
      }}>
        <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '5px' }}>
          🎨 Custom Shaders
        </div>
        <div style={{ fontSize: '14px', opacity: 0.7 }}>
          GLSL Shader Programming
        </div>
      </div>

      {/* Shader Selection */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        background: 'rgba(0, 0, 0, 0.85)',
        padding: '15px',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        flexWrap: 'wrap',
        maxWidth: '90%',
        justifyContent: 'center'
      }}>
        {shaders.map(shader => (
          <button
            key={shader.id}
            onClick={() => setSelectedShader(shader.id)}
            style={{
              padding: '10px 15px',
              background: selectedShader === shader.id 
                ? 'linear-gradient(135deg, rgba(255, 0, 150, 0.4), rgba(0, 150, 255, 0.4))' 
                : 'rgba(255, 255, 255, 0.1)',
              border: selectedShader === shader.id 
                ? '2px solid rgba(255, 255, 255, 0.8)' 
                : '2px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: 'system-ui, sans-serif',
              transition: 'all 0.3s',
              minWidth: '100px'
            }}
            onMouseEnter={(e) => {
              if (selectedShader !== shader.id) {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedShader !== shader.id) {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }
            }}
          >
            <div style={{ fontSize: '18px', marginBottom: '3px' }}>{shader.icon}</div>
            <div style={{ fontSize: '11px' }}>{shader.name}</div>
            <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '2px' }}>
              {shader.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Info */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px 20px',
        borderRadius: '10px',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '11px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        maxWidth: '200px'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>Shader Details:</div>
        <div style={{ opacity: 0.8, lineHeight: '1.6' }}>
          {selectedShader === 'lava' && '• Vertex distortion\n• Flow animation\n• Color gradient'}
          {selectedShader === 'holographic' && '• Fresnel effect\n• Scanlines\n• Transparency'}
          {selectedShader === 'glitch' && '• RGB shift\n• Random offsets\n• Line corruption'}
          {selectedShader === 'water' && '• Wave motion\n• Depth colors\n• Foam effect'}
          {selectedShader === 'shield' && '• Hex pattern\n• Energy pulses\n• Force field'}
        </div>
      </div>
    </div>
  );
}
