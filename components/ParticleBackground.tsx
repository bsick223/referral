"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const DataVisualizationBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGLError, setWebGLError] = useState<string | null>(null);

  useEffect(() => {
    console.log("DataVisualizationBackground mounting");

    // Check for WebGL support before initializing
    const checkWebGLSupport = (): boolean => {
      try {
        const canvas = document.createElement("canvas");
        const supportedContexts = ["webgl2", "webgl", "experimental-webgl"];

        let gl = null;
        for (const contextType of supportedContexts) {
          gl = canvas.getContext(contextType);
          if (gl) {
            console.log(`WebGL supported with ${contextType}`);
            return true;
          }
        }

        setWebGLError("WebGL not supported in this browser");
        return false;
      } catch (e) {
        console.error("Error checking WebGL support:", e);
        setWebGLError("Error detecting WebGL support");
        return false;
      }
    };

    // Only proceed if the mounting element is available
    const initScene = () => {
      const currentRef = mountRef.current;
      if (!currentRef) {
        console.log("Mount ref not available, trying again...");
        requestAnimationFrame(initScene);
        return;
      }

      // Check WebGL support first
      if (!checkWebGLSupport()) {
        console.error("WebGL not supported, falling back to static content");
        return;
      }

      console.log("Initializing Three.js data visualization scene");

      // Scene setup
      const scene = new THREE.Scene();

      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 24);
      camera.lookAt(0, 0, 0);

      // Renderer setup with error handling
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false, // Don't fail on performance issues
        });
      } catch (e) {
        console.error("Error creating WebGL renderer:", e);
        setWebGLError("Could not create WebGL renderer");
        return;
      }

      // If renderer creation was successful
      if (!renderer) {
        setWebGLError("WebGL renderer could not be created");
        return;
      }

      try {
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        currentRef.appendChild(renderer.domElement);
        renderer.setClearColor(0x000000, 0);
      } catch (e) {
        console.error("Error setting up renderer:", e);
        setWebGLError("Error configuring WebGL renderer");
        return;
      }

      // =================================
      // Grid System
      // =================================
      const createGrid = () => {
        const gridSize = 45;
        const gridDivisions = 20;
        const gridGeometry = new THREE.PlaneGeometry(
          gridSize,
          gridSize,
          gridDivisions,
          gridDivisions
        );

        // Custom grid shader
        const gridMaterial = new THREE.ShaderMaterial({
          vertexShader: `
            varying vec2 vUv;
            varying vec3 vPosition;
            
            void main() {
              vUv = uv;
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec2 vUv;
            varying vec3 vPosition;
            uniform float uTime;
            
            float grid(vec2 st, float res) {
              vec2 grid = fract(st * res);
              return (step(0.98, grid.x) + step(0.98, grid.y)) * 0.5;
            }
            
            void main() {
              // Base grid
              float baseGrid = grid(vUv, 20.0) * 0.3;
              
              // Animated pulse
              float timeFactor = sin(uTime * 0.5) * 0.5 + 0.5;
              float pulse = sin(vPosition.x * 2.0 + vPosition.y * 2.0 + uTime * 2.0) * 0.5 + 0.5;
              pulse = smoothstep(0.3, 0.7, pulse) * timeFactor * 0.2;
              
              // Distance from center for radial fade
              vec2 center = vUv - 0.5;
              float dist = length(center);
              float alpha = smoothstep(0.8, 0.0, dist) * 0.4;
              
              // Combine grid and pulse
              float finalGrid = baseGrid + pulse;
              
              // Create color gradient (blue to purple)
              vec3 color1 = vec3(0.1, 0.3, 0.8); // Blue
              vec3 color2 = vec3(0.6, 0.2, 0.8); // Purple
              vec3 color3 = vec3(0.9, 0.3, 0.1); // Orange
              
              // Mix colors based on position and time
              float colorMix = sin(vPosition.x * 0.2 + vPosition.y * 0.2 + uTime * 0.3) * 0.5 + 0.5;
              vec3 finalColor = mix(color1, color2, colorMix);
              finalColor = mix(finalColor, color3, pulse * 2.0);
              
              gl_FragColor = vec4(finalColor, alpha * finalGrid);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          uniforms: {
            uTime: { value: 0 },
          },
        });

        // Create grid mesh
        const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
        gridMesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        gridMesh.position.y = -6; // Position below the scene
        scene.add(gridMesh);

        return { mesh: gridMesh, material: gridMaterial };
      };

      // Create grid
      const grid = createGrid();

      // =================================
      // Data Nodes
      // =================================

      // Node parameters
      const nodeParams = {
        count: 70,
        minSize: 0.1,
        maxSize: 0.7,
        connectionThreshold: 10, // Maximum distance for nodes to connect
        colors: [
          new THREE.Color("#ff7e00"), // Orange
          new THREE.Color("#3b82f6"), // Blue
          new THREE.Color("#8b5cf6"), // Purple
          new THREE.Color("#ffffff"), // White
        ],
      };

      // Node generation
      const createNodes = () => {
        // Create geometry
        const nodesGeometry = new THREE.BufferGeometry();
        const nodePositions = new Float32Array(nodeParams.count * 3);
        const nodeSizes = new Float32Array(nodeParams.count);
        const nodeColors = new Float32Array(nodeParams.count * 3);
        const nodeSpeed = new Float32Array(nodeParams.count);

        // Create nodes with random positions, sizes, and colors
        for (let i = 0; i < nodeParams.count; i++) {
          // Position nodes in a disc shape (concentrated around the center)
          const radius = 20 * Math.pow(Math.random(), 0.5); // Squared distribution for more central density
          const theta = Math.random() * Math.PI * 2;
          const height = (Math.random() - 0.5) * 14;

          nodePositions[i * 3] = Math.cos(theta) * radius;
          nodePositions[i * 3 + 1] = height;
          nodePositions[i * 3 + 2] = Math.sin(theta) * radius;

          // Random sizes - important nodes (closer to center) are larger
          const distanceFromCenter = Math.sqrt(
            Math.pow(nodePositions[i * 3], 2) +
              Math.pow(nodePositions[i * 3 + 2], 2)
          );

          // Size based on distance from center
          const sizeFactor = 1 - Math.min(distanceFromCenter / 20, 1);
          nodeSizes[i] =
            nodeParams.minSize +
            sizeFactor * (nodeParams.maxSize - nodeParams.minSize);

          // More important nodes (larger) move slower
          nodeSpeed[i] = 0.2 + (1 - sizeFactor) * 0.8;

          // Color assignment - important nodes get more vibrant colors
          const colorIndex = Math.floor(
            Math.random() * nodeParams.colors.length
          );
          const color = nodeParams.colors[colorIndex];

          nodeColors[i * 3] = color.r;
          nodeColors[i * 3 + 1] = color.g;
          nodeColors[i * 3 + 2] = color.b;
        }

        // Set geometry attributes
        nodesGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(nodePositions, 3)
        );
        nodesGeometry.setAttribute(
          "size",
          new THREE.BufferAttribute(nodeSizes, 1)
        );
        nodesGeometry.setAttribute(
          "color",
          new THREE.BufferAttribute(nodeColors, 3)
        );
        nodesGeometry.setAttribute(
          "speed",
          new THREE.BufferAttribute(nodeSpeed, 1)
        );

        // Custom shader material for nodes
        const nodesMaterial = new THREE.ShaderMaterial({
          vertexShader: `
            attribute float size;
            attribute vec3 color;
            attribute float speed;
            varying vec3 vColor;
            varying float vSize;
            uniform float uTime;
            
            void main() {
              vColor = color;
              vSize = size;
              
              // Calculate animated position
              vec3 pos = position;
              
              // Gentle oscillating movement
              float timeFactor = uTime * speed;
              pos.x += sin(timeFactor * 0.3 + position.z * 0.2) * 0.3;
              pos.y += cos(timeFactor * 0.4 + position.x * 0.2) * 0.2;
              pos.z += sin(timeFactor * 0.5 + position.y * 0.2) * 0.3;
              
              // Project position to screen space
              vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
              gl_PointSize = size * (400.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            varying vec3 vColor;
            varying float vSize;
            uniform float uTime;
            
            void main() {
              // Create circular points with soft edges
              float dist = length(gl_PointCoord - vec2(0.5));
              if (dist > 0.5) discard;
              
              // Glow effect
              float glow = 1.0 - smoothstep(0.0, 0.5, dist);
              glow = pow(glow, 1.5);
              
              // Pulse effect based on size (larger nodes pulse more)
              float pulse = (sin(uTime * 2.0 * (0.5 + vSize)) * 0.15 + 0.85) * glow;
              
              // Final color with brightness based on pulse
              vec3 finalColor = vColor * pulse * 1.5;
              gl_FragColor = vec4(finalColor, glow);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          uniforms: {
            uTime: { value: 0 },
          },
        });

        // Create points
        const nodePoints = new THREE.Points(nodesGeometry, nodesMaterial);
        nodePoints.scale.set(1.2, 1.2, 1.2);
        scene.add(nodePoints);

        return {
          points: nodePoints,
          geometry: nodesGeometry,
          material: nodesMaterial,
        };
      };

      // Create nodes
      const nodes = createNodes();

      // =================================
      // Connection Lines
      // =================================

      // Function to create connection lines between nodes
      const createConnections = () => {
        // Line geometry
        const linesGeometry = new THREE.BufferGeometry();

        // Material with custom shader
        const linesMaterial = new THREE.ShaderMaterial({
          vertexShader: `
            attribute float opacity;
            attribute vec3 color;
            varying float vOpacity;
            varying vec3 vColor;
            
            void main() {
              vColor = color;
              vOpacity = opacity;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying float vOpacity;
            varying vec3 vColor;
            uniform float uTime;
            
            void main() {
              // Animated flow effect
              float flow = sin(uTime * 3.0) * 0.5 + 0.5;
              gl_FragColor = vec4(vColor, vOpacity * (0.6 + flow * 0.4));
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          uniforms: {
            uTime: { value: 0 },
          },
        });

        // Create lines
        const lines = new THREE.LineSegments(linesGeometry, linesMaterial);
        scene.add(lines);

        return {
          lines,
          geometry: linesGeometry,
          material: linesMaterial,
        };
      };

      // Create connections
      const connections = createConnections();

      // Function to update connections based on node positions
      const updateConnections = () => {
        // Get current node positions
        const positions = nodes.geometry.attributes.position.array;
        const colors = nodes.geometry.attributes.color.array;

        // Arrays to store line vertices, colors, and opacities
        const linePositions = [];
        const lineColors = [];
        const lineOpacities = [];

        // Check distances between nodes and create connections
        for (let i = 0; i < nodeParams.count; i++) {
          const ix = i * 3;
          const iy = i * 3 + 1;
          const iz = i * 3 + 2;

          for (let j = i + 1; j < nodeParams.count; j++) {
            const jx = j * 3;
            const jy = j * 3 + 1;
            const jz = j * 3 + 2;

            // Calculate distance between nodes
            const dx = positions[ix] - positions[jx];
            const dy = positions[iy] - positions[jy];
            const dz = positions[iz] - positions[jz];
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            // Connect if within threshold
            if (distance < nodeParams.connectionThreshold) {
              // Calculate opacity based on distance (closer = more opaque)
              const opacity = 1 - distance / nodeParams.connectionThreshold;

              // Add line vertices
              linePositions.push(
                positions[ix],
                positions[iy],
                positions[iz],
                positions[jx],
                positions[jy],
                positions[jz]
              );

              // Mix colors from both nodes
              const color1 = [colors[ix], colors[iy], colors[iz]];
              const color2 = [colors[jx], colors[jy], colors[jz]];

              // Add colors (one for each vertex)
              for (let k = 0; k < 2; k++) {
                lineColors.push(
                  ...color1.map((c, idx) => c * 0.6 + color2[idx] * 0.4)
                );
              }

              // Add opacity for each vertex
              for (let k = 0; k < 2; k++) {
                lineOpacities.push(opacity);
              }
            }
          }
        }

        // Update geometry
        connections.geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(linePositions, 3)
        );

        connections.geometry.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(lineColors, 3)
        );

        connections.geometry.setAttribute(
          "opacity",
          new THREE.Float32BufferAttribute(lineOpacities, 1)
        );
      };

      // =================================
      // Data Pulses
      // =================================

      // Create pulses that travel along the connections
      const createDataPulses = () => {
        const pulseCount = 40;
        const pulseGeometry = new THREE.BufferGeometry();
        const pulsePositions = new Float32Array(pulseCount * 3);
        const pulseSizes = new Float32Array(pulseCount);
        const pulseColors = new Float32Array(pulseCount * 3);
        const pulseData = [];

        // Initialize pulse data
        for (let i = 0; i < pulseCount; i++) {
          pulseData.push({
            active: false,
            sourceNode: -1,
            targetNode: -1,
            progress: 0,
            speed: 0,
            size: 0,
          });

          pulsePositions[i * 3] = 0;
          pulsePositions[i * 3 + 1] = 0;
          pulsePositions[i * 3 + 2] = 0;
          pulseSizes[i] = 0;
        }

        pulseGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(pulsePositions, 3)
        );
        pulseGeometry.setAttribute(
          "size",
          new THREE.BufferAttribute(pulseSizes, 1)
        );
        pulseGeometry.setAttribute(
          "color",
          new THREE.BufferAttribute(pulseColors, 3)
        );

        // Pulse material
        const pulseMaterial = new THREE.ShaderMaterial({
          vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            
            void main() {
              vColor = color;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = size * (200.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            varying vec3 vColor;
            
            void main() {
              // Create circular pulse with soft edges
              float dist = length(gl_PointCoord - vec2(0.5));
              if (dist > 0.5) discard;
              
              // Add glow
              float glow = 1.0 - smoothstep(0.0, 0.5, dist);
              glow = pow(glow, 1.5);
              
              vec3 finalColor = vColor;
              gl_FragColor = vec4(finalColor, glow);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });

        const pulses = new THREE.Points(pulseGeometry, pulseMaterial);
        scene.add(pulses);

        return {
          pulses,
          geometry: pulseGeometry,
          material: pulseMaterial,
          data: pulseData,
        };
      };

      // Create pulses
      const dataPulses = createDataPulses();

      // Function to update pulse positions and create new pulses
      const updatePulses = (time: number) => {
        // Get node positions
        const nodePositions = nodes.geometry.attributes.position.array;
        const nodeColors = nodes.geometry.attributes.color.array;

        // Get pulse data
        const pulsePositions = dataPulses.geometry.attributes.position.array;
        const pulseSizes = dataPulses.geometry.attributes.size.array;
        const pulseColors = dataPulses.geometry.attributes.color.array;

        // Random chance to create new pulse
        if (Math.random() < 0.05) {
          // Find an inactive pulse
          for (let i = 0; i < dataPulses.data.length; i++) {
            if (!dataPulses.data[i].active) {
              // Pick source and target nodes
              const sourceNode = Math.floor(Math.random() * nodeParams.count);

              // Find a target node that's close enough
              const candidates = [];
              for (let j = 0; j < nodeParams.count; j++) {
                if (j !== sourceNode) {
                  const sx = nodePositions[sourceNode * 3];
                  const sy = nodePositions[sourceNode * 3 + 1];
                  const sz = nodePositions[sourceNode * 3 + 2];

                  const tx = nodePositions[j * 3];
                  const ty = nodePositions[j * 3 + 1];
                  const tz = nodePositions[j * 3 + 2];

                  const dx = tx - sx;
                  const dy = ty - sy;
                  const dz = tz - sz;
                  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                  if (distance < nodeParams.connectionThreshold) {
                    candidates.push({
                      index: j,
                      distance: distance,
                    });
                  }
                }
              }

              // If we found candidates, create a pulse
              if (candidates.length > 0) {
                const target =
                  candidates[Math.floor(Math.random() * candidates.length)];

                // Activate pulse
                dataPulses.data[i] = {
                  active: true,
                  sourceNode: sourceNode,
                  targetNode: target.index,
                  progress: 0,
                  speed: 0.02 + Math.random() * 0.03,
                  size: 0.1 + Math.random() * 0.15,
                };

                // Set initial position (at source node)
                pulsePositions[i * 3] = nodePositions[sourceNode * 3];
                pulsePositions[i * 3 + 1] = nodePositions[sourceNode * 3 + 1];
                pulsePositions[i * 3 + 2] = nodePositions[sourceNode * 3 + 2];

                // Set size
                pulseSizes[i] = dataPulses.data[i].size;

                // Set color (use source node color)
                pulseColors[i * 3] = nodeColors[sourceNode * 3];
                pulseColors[i * 3 + 1] = nodeColors[sourceNode * 3 + 1];
                pulseColors[i * 3 + 2] = nodeColors[sourceNode * 3 + 2];

                break;
              }
            }
          }
        }

        // Update active pulses
        for (let i = 0; i < dataPulses.data.length; i++) {
          if (dataPulses.data[i].active) {
            const pulse = dataPulses.data[i];

            // Update progress
            pulse.progress += pulse.speed;

            // When complete, deactivate
            if (pulse.progress >= 1.0) {
              pulse.active = false;
              pulseSizes[i] = 0;
              continue;
            }

            // Interpolate position between source and target nodes
            const sourceNode = pulse.sourceNode;
            const targetNode = pulse.targetNode;

            const sx = nodePositions[sourceNode * 3];
            const sy = nodePositions[sourceNode * 3 + 1];
            const sz = nodePositions[sourceNode * 3 + 2];

            const tx = nodePositions[targetNode * 3];
            const ty = nodePositions[targetNode * 3 + 1];
            const tz = nodePositions[targetNode * 3 + 2];

            // Add some arc to the path
            const midProgress = Math.sin(pulse.progress * Math.PI);
            const arcHeight = 0.5; // Arc height factor

            pulsePositions[i * 3] = sx + (tx - sx) * pulse.progress;
            pulsePositions[i * 3 + 1] =
              sy + (ty - sy) * pulse.progress + midProgress * arcHeight;
            pulsePositions[i * 3 + 2] = sz + (tz - sz) * pulse.progress;

            // Update size with pulse effect
            pulseSizes[i] = pulse.size * (1.0 + Math.sin(time * 10) * 0.2);
          }
        }

        // Update geometry attributes
        dataPulses.geometry.attributes.position.needsUpdate = true;
        dataPulses.geometry.attributes.size.needsUpdate = true;
      };

      // =================================
      // Animation
      // =================================

      // Animation loop
      let animationId: number;

      function animate() {
        animationId = requestAnimationFrame(animate);

        // Animation updates
        const time = Date.now() * 0.001;

        // Update node positions (gently animating)
        if (nodes.geometry.attributes.position) {
          // Update connections every frame
          updateConnections();

          // Update data pulses
          updatePulses(time);
        }

        // Update uniforms
        if (grid.material.uniforms) {
          grid.material.uniforms.uTime.value = time;
        }

        if (nodes.material.uniforms) {
          nodes.material.uniforms.uTime.value = time;
        }

        if (connections.material.uniforms) {
          connections.material.uniforms.uTime.value = time;
        }

        // Gentle camera movement
        camera.position.x = Math.sin(time * 0.1) * 1.5;
        camera.position.y = Math.cos(time * 0.15) * 1;
        camera.lookAt(0, 0, 0);

        // Render
        try {
          renderer.render(scene, camera);
        } catch (e) {
          console.error("Error during rendering:", e);
          setWebGLError("Rendering error occurred");
          cancelAnimationFrame(animationId);
          return;
        }
      }

      // Call animation for the first time
      try {
        animate();
      } catch (e) {
        console.error("Error starting animation:", e);
        setWebGLError("Animation could not start");
        return;
      }

      // Handle window resize
      const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      // Resize handler
      window.addEventListener("resize", handleResize);

      // Cleanup
      return () => {
        console.log("Cleaning up DataVisualizationBackground");

        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(animationId);

        // Dispose geometries and materials
        grid.mesh.geometry.dispose();
        grid.material.dispose();

        nodes.geometry.dispose();
        nodes.material.dispose();

        connections.geometry.dispose();
        connections.material.dispose();

        dataPulses.geometry.dispose();
        dataPulses.material.dispose();

        // Remove from DOM
        if (currentRef && currentRef.contains(renderer.domElement)) {
          currentRef.removeChild(renderer.domElement);
        }
      };
    };

    // Start initialization
    initScene();

    // Cleanup
    return () => {
      console.log("DataVisualizationBackground unmounting");
    };
  }, []);

  // Render the canvas container and a fallback if WebGL fails
  return (
    <>
      <div
        ref={mountRef}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
        }}
        data-testid="data-visualization-background"
      />

      {webGLError && (
        <div
          className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-blue-900/50 via-purple-900/50 to-black/50"
          style={{
            height: "100vh",
            width: "100vw",
          }}
          data-testid="webgl-fallback-background"
        >
          {/* CSS fallback instead of Three.js */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
            <div
              className="absolute w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"
              style={{ transform: "translate(20%, 20%)" }}
            ></div>
            <div
              className="absolute w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent"
              style={{ transform: "translate(-20%, -10%)" }}
            ></div>
          </div>
        </div>
      )}
    </>
  );
};

export default DataVisualizationBackground;
