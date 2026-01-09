import React, { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, Text, OrbitControls, Center, Stage } from "@react-three/drei";
import * as THREE from "three";

// Reusable Tooth Geometry based on SVG path:
// M 10,5 Q 20,0 30,5 Q 40,8 38,18 L 35,42 Q 20,50 5,42 L 2,18 Q 0,8 10,5 Z
const createToothShape = () => {
    const shape = new THREE.Shape();
    // We offset by -20, -25 to center it roughly (original 40x50)
    const offsetX = 20;
    const offsetY = 25;

    shape.moveTo(10 - offsetX, 50 - (5 + offsetY)); // SVG Y is down, Three Y is up. Let's Flip Y coords.
    // Actually, easier to just draw it matching SVG and rotate the mesh 180 deg around X.

    // Drawing matching SVG logic exactly:
    shape.moveTo(10, 5);
    shape.quadraticCurveTo(20, 0, 30, 5);
    shape.quadraticCurveTo(40, 8, 38, 18);
    shape.lineTo(35, 42);
    shape.quadraticCurveTo(20, 50, 5, 42);
    shape.lineTo(2, 18);
    shape.quadraticCurveTo(0, 8, 10, 5);

    return shape;
};

const Tooth = ({ id, position, isSelected, onClick }) => {
    const [hovered, setHovered] = useState(false);

    // Create geometry once
    const toothGeometry = useMemo(() => {
        const shape = createToothShape();
        return new THREE.ExtrudeGeometry(shape, {
            depth: 10,
            bevelEnabled: true,
            bevelThickness: 2,
            bevelSize: 1,
            bevelSegments: 3
        });
    }, []);

    return (
        <group position={position} onClick={(e) => { e.stopPropagation(); onClick(id); }}>
            {/* Label */}
            <Text
                position={[20, 60, 0]} // Above the tooth (since we flip, Y goes down? Layout needs check)
                // With rotation X=180, Y+ is DOWN in local space. 
                // Let's rely on parent arrangement.
                rotation={[Math.PI, 0, 0]} // Text needs to be flipped back if parent is flipped
                fontSize={12}
                color="#333"
                anchorX="center"
                anchorY="middle"
            >
                {id}
            </Text>

            {/* Tooth Model */}
            <mesh
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                rotation={[Math.PI, 0, 0]} // Flip to upright the SVG coordinates
                position={[0, 0, 0]} // Centering adjustment if needed
            >
                <primitive object={toothGeometry} attach="geometry" />
                <meshStandardMaterial
                    color={isSelected ? "#0056b3" : hovered ? "#aaddff" : "#f0f0f0"}
                    metalness={0.1}
                    roughness={0.5}
                />
                {/* Outlines? EdgesGeometry? */}
            </mesh>
        </group>
    );
};

const ThreeDentalChart = ({ selectedTeeth = [], onToothSelect }) => {
    // Linear Layout Config

    const generateTeeth = () => {
        const teeth = [];
        const xStart = -200;
        const spacing = 50;
        const upperY = 60;
        const lowerY = -60;

        // We center the tooth geometry (roughly 40 wide).
        // Let's adjust spacing.

        // Q1: 18 to 11
        [18, 17, 16, 15, 14, 13, 12, 11].forEach((id, i) => {
            teeth.push({ id, x: xStart + (i * spacing), y: upperY });
        });

        // Q2: 21 to 28
        const gap = 40;
        [21, 22, 23, 24, 25, 26, 27, 28].forEach((id, i) => {
            teeth.push({ id, x: xStart + (8 * spacing) + gap + (i * spacing), y: upperY });
        });

        // Lower Arch
        // Q4: 48 to 41
        [48, 47, 46, 45, 44, 43, 42, 41].forEach((id, i) => {
            teeth.push({ id, x: xStart + (i * spacing), y: lowerY });
        });

        // Q3: 31 to 38
        [31, 32, 33, 34, 35, 36, 37, 38].forEach((id, i) => {
            teeth.push({ id, x: xStart + (8 * spacing) + gap + (i * spacing), y: lowerY });
        });

        return teeth;
    };

    const teethData = generateTeeth();

    return (
        <div className="w-full h-96 bg-gray-50 rounded-lg border shadow-inner relative">
            <div className="absolute top-4 left-4 z-10 font-mono text-gray-500 text-sm">
                3D SYSTEM: DEREC-LINEAR (SHAPE V3)
                <br />
                ROTATION LOCKED
            </div>

            <Canvas shadows dpr={[1, 2]}>
                <OrthographicCamera makeDefault position={[0, 0, 500]} zoom={0.8} near={0.1} far={2000} />

                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
                <directionalLight position={[-10, -20, 10]} intensity={0.5} />

                <OrbitControls
                    enableRotate={false}
                    enableZoom={true}
                    minZoom={0.5}
                    maxZoom={2}
                />

                <Center>
                    <group>
                        {teethData.map((t) => (
                            <Tooth
                                key={t.id}
                                id={t.id}
                                position={[t.x, t.y, 0]}
                                isSelected={selectedTeeth.includes(t.id)}
                                onClick={onToothSelect}
                            />
                        ))}
                    </group>
                </Center>
            </Canvas>
        </div>
    );
};

export default ThreeDentalChart;
