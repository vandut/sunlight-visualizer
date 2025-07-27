import React, { useEffect } from 'react';
import * as THREE from 'three';
import useSimulationStore from '../stores/useSimulationStore';

interface ModelProps {
  scene: THREE.Group;
}

const Model: React.FC<ModelProps> = ({ scene }) => {
  const modelOpacity = useSimulationStore((state) => state.modelOpacity);

  useEffect(() => {
    if (scene) {
      scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;

          // 1. Fix the model's geometry by computing normals.
          mesh.geometry.computeVertexNormals();

          // 2. Set shadow properties on the mesh itself.
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // 3. Apply opacity to the existing material.
          const applyOpacity = (mat: THREE.Material) => {
            mat.transparent = modelOpacity < 1.0;
            mat.opacity = modelOpacity;
          };

          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(applyOpacity);
          } else if (mesh.material) {
            applyOpacity(mesh.material);
          }
        }
      });
    }
  }, [scene, modelOpacity]);

  return <primitive object={scene} />;
};

export default Model;