"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const WaveFieldBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("WaveFieldBackground mounting");

    // Only proceed if the mounting element is available
    const initScene = () => {
      const currentRef = mountRef.current;
      if (!currentRef) {
        console.log("Mount ref not available, trying again...");
        requestAnimationFrame(initScene);
        return;
      }

      console.log("Initializing Three.js scene");

      // Scene setup
      const scene = new THREE.Scene();

      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 30);
      camera.lookAt(0, 0, 0);

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      currentRef.appendChild(renderer.domElement);
      renderer.setClearColor(0x000000, 0);

      // =================================
      // Create Wave Mesh
      // =================================

      // Size of the wave grid
      const width = 60;
      const height = 60;
      const segments = 120;

      // Create wave plane geometry
      const geometry = new THREE.PlaneGeometry(
        width,
        height,
        segments,
        segments
      );

      // Define custom shader for the waves
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          colorA: { value: new THREE.Color("#ff7e00") }, // Orange
          colorB: { value: new THREE.Color("#3b82f6") }, // Blue
          colorC: { value: new THREE.Color("#8b5cf6") }, // Purple
        },
        vertexShader: `
          uniform float time;
          varying vec2 vUv;
          varying float vElevation;
          
          // Simplex noise implementation
          // Credits: Ian McEwan, Ashima Arts
          vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
          
          float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                  + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                    dot(x12.zw,x12.zw)), 0.0);
            m = m*m;
            m = m*m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
          }
          
          void main() {
            vUv = uv;
            
            // Calculate multiple waves
            float elevation = 0.0;
            
            // First wave set
            float wave1 = sin((position.x * 0.5 + time * 0.5)) * 0.5;
            float wave2 = sin((position.y * 0.5 + time * 0.7)) * 0.5;
            
            // Noise-based waves
            float noise1 = snoise(vec2(position.x * 0.05 + time * 0.1, position.y * 0.05 + time * 0.1)) * 1.5;
            float noise2 = snoise(vec2(position.x * 0.02 - time * 0.15, position.y * 0.02 + time * 0.05)) * 2.0;
            
            // Combine waves
            elevation = wave1 + wave2 + noise1 + noise2;
            elevation *= 0.8; // Scale down the height
            
            // Modify vertex position
            vec3 newPosition = position;
            newPosition.z += elevation;
            
            vElevation = elevation;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 colorA;
          uniform vec3 colorB;
          uniform vec3 colorC;
          
          varying vec2 vUv;
          varying float vElevation;
          
          void main() {
            // Create a flowing color pattern based on elevation and position
            float strength = smoothstep(-1.0, 1.0, vElevation);
            
            // Dynamic flowing pattern
            float pattern = sin((vUv.x * 10.0) + (vUv.y * 10.0) + time) * 0.5 + 0.5;
            pattern *= strength;
            
            // Create a blend of colors
            vec3 mixColorAB = mix(colorA, colorB, pattern);
            vec3 finalColor = mix(mixColorAB, colorC, sin(time * 0.2) * 0.5 + 0.5);
            
            // Add a subtle glow effect
            float glow = smoothstep(0.0, 0.5, strength) * 0.6;
            finalColor += glow * mix(colorA, colorB, sin(time * 0.3));
            
            // Set transparency based on elevation
            float alpha = 0.7 * smoothstep(-2.0, 0.8, vElevation);
            
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
      });

      // Create wave mesh and add to scene
      const waveMesh = new THREE.Mesh(geometry, material);
      waveMesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
      waveMesh.position.y = -5; // Position below center
      scene.add(waveMesh);

      // =================================
      // Create Floating Particles
      // =================================

      // Particle count and geometry
      const particleCount = 300;
      const particleGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      const particleSizes = new Float32Array(particleCount);

      // Set random particle positions in a dome shape above the waves
      for (let i = 0; i < particleCount; i++) {
        // Dome distribution
        const radius = 25 + Math.random() * 15;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 0.5; // Half sphere (dome)

        particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i * 3 + 1] = Math.abs(radius * Math.cos(phi)); // Keep Y positive for dome
        particlePositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

        // Vary particle sizes
        particleSizes[i] = Math.random() * 0.6 + 0.2;
      }

      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(particlePositions, 3)
      );
      particleGeometry.setAttribute(
        "size",
        new THREE.BufferAttribute(particleSizes, 1)
      );

      // Particle material with custom shader
      const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          pointTexture: { value: createCircleTexture() },
        },
        vertexShader: `
          uniform float time;
          attribute float size;
          varying vec3 vPosition;
          
          void main() {
            vPosition = position;
            
            // Add gentle floating motion
            vec3 pos = position;
            pos.y += sin(time * 0.2 + position.x * 0.05) * 1.0;
            pos.x += cos(time * 0.3 + position.z * 0.05) * 1.0;
            pos.z += sin(time * 0.2 + position.y * 0.05) * 1.0;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (40.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform sampler2D pointTexture;
          varying vec3 vPosition;
          
          void main() {
            // Soft circular particles
            vec4 texColor = texture2D(pointTexture, gl_PointCoord);
            
            // Create color based on position and time
            float r = sin(time * 0.2 + vPosition.x * 0.05) * 0.5 + 0.5;
            float g = sin(time * 0.3 + vPosition.y * 0.05) * 0.3 + 0.3;
            float b = sin(time * 0.4 + vPosition.z * 0.05) * 0.5 + 0.5;
            
            vec3 color = vec3(r, g, b);
            
            gl_FragColor = vec4(color, texColor.a * 0.6);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      particles.position.y = 0; // Position above the waves
      scene.add(particles);

      // Helper function to create circular texture for particles
      function createCircleTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;

        const context = canvas.getContext("2d");
        if (context) {
          context.beginPath();
          context.arc(32, 32, 28, 0, Math.PI * 2);
          context.closePath();

          // Create radial gradient
          const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
          gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
          gradient.addColorStop(0.5, "rgba(200, 200, 255, 0.5)");
          gradient.addColorStop(1, "rgba(100, 100, 255, 0)");

          context.fillStyle = gradient;
          context.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
      }

      // Animation loop
      let time = 0;
      function animate() {
        const animationId = requestAnimationFrame(animate);
        time += 0.01;

        // Update shader uniforms
        if (material.uniforms) {
          material.uniforms.time.value = time;
        }
        if (particleMaterial.uniforms) {
          particleMaterial.uniforms.time.value = time;
        }

        // Gentle camera movement
        camera.position.x = Math.sin(time * 0.05) * 3;
        camera.position.y = Math.cos(time * 0.1) * 2 + 5;
        camera.lookAt(0, 0, 0);

        // Render the scene
        renderer.render(scene, camera);

        // Cleanup function
        return () => {
          cancelAnimationFrame(animationId);
          if (currentRef && currentRef.contains(renderer.domElement)) {
            currentRef.removeChild(renderer.domElement);
          }
          geometry.dispose();
          material.dispose();
          particleGeometry.dispose();
          particleMaterial.dispose();
        };
      }

      // Window resize handler
      const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener("resize", handleResize);

      // Start animation
      const cleanup = animate();

      // Return cleanup function
      return () => {
        console.log("Cleaning up WaveFieldBackground");
        window.removeEventListener("resize", handleResize);
        if (cleanup) cleanup();
      };
    };

    // Start initialization
    initScene();

    // Cleanup
    return () => {
      console.log("WaveFieldBackground unmounting");
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
      data-testid="wave-field-background"
    />
  );
};

export default WaveFieldBackground;
