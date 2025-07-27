import React, { useRef, useEffect } from 'react';
import useSimulationStore from '../stores/useSimulationStore';

const CompassDisplay = () => {
  const cameraAzimuth = useSimulationStore((state) => state.cameraAzimuth);
  const triggerCameraReset = useSimulationStore(
    (state) => state.triggerCameraReset
  );

  // The camera's azimuthal angle is in radians. Convert it to degrees for CSS.
  // The UI compass must rotate WITH the camera's horizontal rotation. A positive azimuthal
  // angle (camera rotated right) means the world's North is now on the right of the screen,
  // so the compass dial must also rotate to the right (positive degrees).
  const rotationDegrees = cameraAzimuth * (180 / Math.PI);

  const compassRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  // On mount, find the single canvas element to dispatch events to.
  useEffect(() => {
    canvasRef.current = document.querySelector('canvas');
  }, []);

  const handlePointerMove = (e: PointerEvent) => {
    if (isDraggingRef.current) return;

    const DRAG_THRESHOLD = 5; // pixels
    const currentPos = { x: e.clientX, y: e.clientY };
    const dx = currentPos.x - startPosRef.current.x;
    const dy = currentPos.y - startPosRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > DRAG_THRESHOLD) {
      isDraggingRef.current = true;

      const compassEl = compassRef.current;
      const canvasEl = canvasRef.current;
      if (!compassEl || !canvasEl) return;

      // Clean up our temporary listeners and release capture
      compassEl.onpointermove = null;
      compassEl.onpointerup = null;
      compassEl.releasePointerCapture(e.pointerId);

      // Make the compass 'invisible' to pointer events for this drag
      compassEl.style.pointerEvents = 'none';

      // Synthesize a 'pointerdown' event on the canvas to start OrbitControls
      const synthesizedEvent = new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        clientX: startPosRef.current.x,
        clientY: startPosRef.current.y,
        pointerId: e.pointerId,
        button: 0,
        pressure: e.pressure,
        pointerType: e.pointerType,
        isPrimary: e.isPrimary,
      });
      canvasEl.dispatchEvent(synthesizedEvent);
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    const compassEl = compassRef.current;
    if (!compassEl) return;

    // Clean up listeners and capture
    compassEl.onpointermove = null;
    compassEl.onpointerup = null;
    compassEl.releasePointerCapture(e.pointerId);

    // A small timeout is necessary to allow the 'pointerup' event to be
    // processed by OrbitControls on the canvas before this element
    // becomes interactive again.
    setTimeout(() => {
      if (compassRef.current) {
        compassRef.current.style.pointerEvents = 'auto';
      }
    }, 50);

    if (!isDraggingRef.current) {
      // If we haven't started dragging, this was a click.
      triggerCameraReset();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only respond to the primary button (left-click/touch)
    if (e.button !== 0) return;

    isDraggingRef.current = false;
    startPosRef.current = { x: e.clientX, y: e.clientY };

    const compassEl = compassRef.current;
    if (!compassEl) return;

    // Capture future pointer events for this interaction
    compassEl.setPointerCapture(e.pointerId);
    compassEl.onpointermove = handlePointerMove;
    compassEl.onpointerup = handlePointerUp;
  };

  return (
    <div
      ref={compassRef}
      onPointerDown={handlePointerDown}
      className="relative w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-slate-200 select-none cursor-pointer"
      style={{
        transform: `rotate(${rotationDegrees}deg)`,
        touchAction: 'none', // Prevent scrolling on mobile when interacting
      }}
      aria-label="Compass. Click to reset view to North. Drag to rotate scene."
      title="Click to reset view to North. Drag to rotate scene."
    >
      {/* North Marker */}
      <span className="absolute top-1 left-1/2 -translate-x-1/2 text-sm font-bold text-red-500">
        N
      </span>

      {/* East Marker */}
      <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm font-medium text-slate-700">
        E
      </span>

      {/* South Marker */}
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-sm font-medium text-slate-700">
        S
      </span>

      {/* West Marker */}
      <span className="absolute top-1/2 left-2 -translate-y-1/2 text-sm font-medium text-slate-700">
        W
      </span>
    </div>
  );
};

export default CompassDisplay;