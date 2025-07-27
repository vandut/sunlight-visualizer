import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';

const CompassGuide = () => {
    const groupRef = useRef<THREE.Group>(null);
    const { size } = useThree();

    // Generate points for the compass circle (radius 1)
    const circlePoints = useMemo(() => {
        const points = [];
        const segments = 64;
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta)));
        }
        return points;
    }, []);

    useFrame(({ camera }) => {
        // Dynamically scale the entire guide to fit the view
        if (groupRef.current && camera instanceof THREE.OrthographicCamera) {
            const worldWidth = size.width / camera.zoom;
            const worldHeight = size.height / camera.zoom;
            const worldRadius = Math.min(worldWidth, worldHeight) * 0.45;
            groupRef.current.scale.set(worldRadius, worldRadius, worldRadius);
        }
    });

    const textFontSize = 0.1; // Relative to radius of 1
    const textPositionOffset = 1.15; // Place text just outside the circle
    const characterSet = "NESW";

    return (
        <group ref={groupRef} position-y={0.01} renderOrder={999}> {/* Lift slightly and set render order */}
            {/* Compass Circle */}
            <Line
                points={circlePoints}
                color="#64748B" // slate-500
                lineWidth={2}
                depthTest={false}
            />

            {/* Cardinal Direction Labels */}
            <Text characters={characterSet} position={[0, 0, -textPositionOffset]} fontSize={textFontSize} anchorX="center" anchorY="middle" rotation={[-Math.PI / 2, 0, 0]}>
                N
                <meshBasicMaterial attach="material" color="#334155" depthTest={false} />
            </Text>
            <Text characters={characterSet} position={[0, 0, textPositionOffset]} fontSize={textFontSize} anchorX="center" anchorY="middle" rotation={[-Math.PI / 2, 0, 0]}>
                S
                <meshBasicMaterial attach="material" color="#334155" depthTest={false} />
            </Text>
            <Text characters={characterSet} position={[textPositionOffset, 0, 0]} fontSize={textFontSize} anchorX="center" anchorY="middle" rotation={[-Math.PI / 2, 0, 0]}>
                E
                <meshBasicMaterial attach="material" color="#334155" depthTest={false} />
            </Text>
            <Text characters={characterSet} position={[-textPositionOffset, 0, 0]} fontSize={textFontSize} anchorX="center" anchorY="middle" rotation={[-Math.PI / 2, 0, 0]}>
                W
                <meshBasicMaterial attach="material" color="#334155" depthTest={false} />
            </Text>
        </group>
    );
};

export default CompassGuide;