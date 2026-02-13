import React, { useRef, useEffect } from 'react';
import { GLView } from 'expo-gl';
import { Renderer, THREE } from 'expo-three';
import { StyleSheet } from 'react-native';

interface Arrow3DProps {
  relativeAngle: number | null;
  distance: number | null;
}

export function Arrow3D({ relativeAngle, distance }: Arrow3DProps) {
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const arrowRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);


  const relativeAngleRef = useRef(relativeAngle);
  const distanceRef = useRef(distance);

  useEffect(() => {
    relativeAngleRef.current = relativeAngle;
    distanceRef.current = distance;
  }, [relativeAngle, distance]);

  const onContextCreate = async (gl: any) => {
    // Create renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    rendererRef.current = renderer;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create arrow group
    const arrowGroup = new THREE.Group();
    arrowRef.current = arrowGroup;

    // Create arrow shaft (cylinder)
    const shaftGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 32);
    const shaftMaterial = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      metalness: 0.5,
      roughness: 0.3,
    });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.y = 1;
    arrowGroup.add(shaft);

    // Create arrow head (cone)
    const headGeometry = new THREE.ConeGeometry(0.3, 0.6, 32);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      metalness: 0.5,
      roughness: 0.3,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.3;
    arrowGroup.add(head);

    // Create base circle
    const baseGeometry = new THREE.CircleGeometry(0.15, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x16213e,
      metalness: 0.3,
      roughness: 0.5,
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.rotation.x = -Math.PI / 2;
    arrowGroup.add(base);

    // Rotate arrow to point upward initially
    arrowGroup.rotation.z = 0;

    scene.add(arrowGroup);

    // Animation loop
    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);

      // Rotate arrow based on relative angle
      if (arrowRef.current && relativeAngleRef.current !== null) {
        const targetRotation = -(relativeAngleRef.current * Math.PI) / 180;

        // Smooth rotation
        const currentRotation = arrowRef.current.rotation.z;
        const diff = targetRotation - currentRotation;

        // Handle angle wrap-around
        let adjustedDiff = diff;
        if (adjustedDiff > Math.PI) adjustedDiff -= 2 * Math.PI;
        if (adjustedDiff < -Math.PI) adjustedDiff += 2 * Math.PI;

        arrowRef.current.rotation.z += adjustedDiff * 0.1; // Smooth interpolation
      }

      // Pulse effect based on distance
      if (arrowRef.current && distanceRef.current !== null) {
        const scale = 1 + Math.sin(Date.now() * 0.003) * 0.05;
        arrowRef.current.scale.set(scale, scale, scale);
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    render();
  };

  useEffect(() => {
    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <GLView
      style={styles.glView}
      onContextCreate={onContextCreate}
    />
  );
}

const styles = StyleSheet.create({
  glView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
