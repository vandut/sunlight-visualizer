import React, { useEffect } from 'react';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import * as THREE from 'three';
import useSimulationStore from '../stores/useSimulationStore';

const ModelLoader = () => {
    const modelData = useSimulationStore((state) => state.modelData);
    const setGltfScene = useSimulationStore((state) => state.setGltfScene);
    const setIsModelLoading = useSimulationStore((state) => state.setIsModelLoading);

    useEffect(() => {
        let isCancelled = false;

        if (!modelData) {
            setGltfScene(null);
            return;
        }

        setIsModelLoading(true);
        const loader = new GLTFLoader();

        // --- Draco Loader Setup ---
        // Draco is a compression library for 3D geometry.
        // We must provide a decoder for GLTFLoader to handle Draco-compressed models.
        const dracoLoader = new DRACOLoader();
        // Point to the decoder files which are hosted on a public CDN.
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        loader.setDRACOLoader(dracoLoader);
        // --- End Draco Loader Setup ---

        loader.load(
            modelData,
            (gltf) => { // onLoad callback
                if (isCancelled) return;

                const clonedScene = gltf.scene.clone();

                // --- Auto-scaling and positioning logic ---
                const box = new THREE.Box3().setFromObject(clonedScene);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const targetSize = 100;
                const scale = maxDim > 0 ? targetSize / maxDim : 1;
                clonedScene.scale.set(scale, scale, scale);
                clonedScene.position.sub(center.multiplyScalar(scale));
                const scaledBox = new THREE.Box3().setFromObject(clonedScene);
                clonedScene.position.y += -scaledBox.min.y;

                // --- Apply persisted transform on load ---
                // Get latest history state directly to avoid re-triggering the effect
                const { history, historyIndex } = useSimulationStore.getState();
                if (history.length > 0 && historyIndex >= 0) {
                    const lastTransform = history[historyIndex];
                    if (lastTransform) {
                        clonedScene.position.fromArray(lastTransform.position);
                        clonedScene.rotation.fromArray(lastTransform.rotation as any);
                        clonedScene.scale.fromArray(lastTransform.scale);
                    }
                }

                setGltfScene(clonedScene);
                setIsModelLoading(false);
            },
            undefined, // onProgress callback (not used)
            (error) => { // onError callback
                if (isCancelled) return;
                console.error('An error happened during model loading:', error);
                alert('Failed to load the 3D model. Please ensure it is a valid .glb file.');
                setGltfScene(null);
                setIsModelLoading(false);
            }
        );
        
        // Cleanup function to prevent state updates if the component unmounts during load
        return () => {
            isCancelled = true;
            // Dispose of the Draco loader resources when the component unmounts or re-runs.
            dracoLoader.dispose();
        };
    // This effect runs when the model data changes. The setters from Zustand (`setGltfScene`,
    // `setIsModelLoading`) are stable and including them in the dependency array is safe.
    }, [modelData, setGltfScene, setIsModelLoading]);

    return null; // This component is a controller and renders nothing.
};

export default ModelLoader;