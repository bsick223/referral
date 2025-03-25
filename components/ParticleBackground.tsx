"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const ParticleBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("ParticleBackground mounting");

    // Create scene, camera, and renderer immediately to avoid potential issues
    const scene = new THREE.Scene();

    // Only proceed if the mounting element is available
    const initScene = () => {
      const currentRef = mountRef.current;
      if (!currentRef) {
        console.log("Mount ref not available, trying again...");
        // Try again in the next frame if not ready
        requestAnimationFrame(initScene);
        return;
      }

      console.log("Initializing Three.js scene");

      // Set up camera
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 20;

      // Set up renderer with explicit pixel ratio
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance

      // Check if the renderer was created successfully
      if (!renderer.domElement) {
        console.error("Failed to create WebGL renderer");
        return;
      }

      currentRef.appendChild(renderer.domElement);
      console.log("Renderer attached to DOM");

      // Force renderer to clear everything
      renderer.setClearColor(0x000000, 0);
      renderer.clear();

      // Create particles
      const particlesCount = 2000;
      const particlesGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particlesCount * 3);
      const particleSizes = new Float32Array(particlesCount);
      const particleColors = new Float32Array(particlesCount * 3);

      // Create a color palette representing oranges, blues, and purples from the site
      const colors = [
        new THREE.Color("#ff7e00"), // orange
        new THREE.Color("#3b82f6"), // blue
        new THREE.Color("#8b5cf6"), // purple
        new THREE.Color("#ffffff"), // white - added for more contrast
      ];

      for (let i = 0; i < particlesCount; i++) {
        // Random positions across a sphere
        const radius = 15 + Math.random() * 10;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i * 3 + 2] = radius * Math.cos(phi);

        // Larger sizes
        particleSizes[i] = Math.random() * 1.5 + 0.5;

        // Apply random color from palette
        const color = colors[Math.floor(Math.random() * colors.length)];
        particleColors[i * 3] = color.r;
        particleColors[i * 3 + 1] = color.g;
        particleColors[i * 3 + 2] = color.b;
      }

      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(particlePositions, 3)
      );
      particlesGeometry.setAttribute(
        "size",
        new THREE.BufferAttribute(particleSizes, 1)
      );
      particlesGeometry.setAttribute(
        "color",
        new THREE.BufferAttribute(particleColors, 3)
      );

      // Create shader material for better looking particles
      const particlesMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
        },
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          uniform float time;
          
          void main() {
            vColor = color;
            
            // Slightly animate position
            vec3 pos = position;
            pos.x += sin(time * 0.2 + pos.z * 0.1) * 0.5;
            pos.y += cos(time * 0.1 + pos.x * 0.1) * 0.5;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (50.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          
          void main() {
            // Create circular particles with soft edges
            float dist = length(gl_PointCoord - vec2(0.5, 0.5));
            if (dist > 0.5) discard;
            
            float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
            gl_FragColor = vec4(vColor, alpha * 0.8);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);

      // Add subtle lines between some particles
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions: number[] = [];
      const lineColors: number[] = [];

      // Connect approximately 15% of particles with lines
      const connectionCount = Math.floor(particlesCount * 0.15);
      for (let i = 0; i < connectionCount; i++) {
        const index1 = Math.floor(Math.random() * particlesCount);
        const index2 = Math.floor(Math.random() * particlesCount);

        // Start point
        linePositions.push(
          particlePositions[index1 * 3],
          particlePositions[index1 * 3 + 1],
          particlePositions[index1 * 3 + 2]
        );

        // End point
        linePositions.push(
          particlePositions[index2 * 3],
          particlePositions[index2 * 3 + 1],
          particlePositions[index2 * 3 + 2]
        );

        // Line color (with increased opacity)
        const color = colors[Math.floor(Math.random() * colors.length)];
        lineColors.push(color.r, color.g, color.b);
        lineColors.push(color.r, color.g, color.b);
      }

      lineGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(linePositions, 3)
      );
      lineGeometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(lineColors, 3)
      );

      const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
      });

      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lines);

      // Animation
      let frameId: number;
      let time = 0;
      const animate = () => {
        frameId = requestAnimationFrame(animate);
        time += 0.01;

        if (particlesMaterial.uniforms) {
          particlesMaterial.uniforms.time.value = time;
        }

        // Rotate entire particle system
        particles.rotation.y = time * 0.05;
        lines.rotation.y = time * 0.05;

        // Subtle camera movement
        camera.position.x = Math.sin(time * 0.1) * 2;
        camera.position.y = Math.cos(time * 0.1) * 2;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      };

      animate();

      // Handle resize
      const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener("resize", handleResize);

      // Call resize once to ensure correct initial size
      handleResize();

      // Cleanup
      return () => {
        console.log("ParticleBackground unmounting");
        cancelAnimationFrame(frameId);
        window.removeEventListener("resize", handleResize);

        if (currentRef.contains(renderer.domElement)) {
          currentRef.removeChild(renderer.domElement);
        }

        // Dispose geometries and materials
        particlesGeometry.dispose();
        lineGeometry.dispose();
        particlesMaterial.dispose();
        lineMaterial.dispose();
      };
    };

    // Start initialization
    initScene();

    return () => {
      console.log("ParticleBackground unmounting");
      // Cleanup handled in the initScene function
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
      data-testid="particle-background"
    />
  );
};

export default ParticleBackground;
