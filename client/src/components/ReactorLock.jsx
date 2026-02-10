import React, { useState, useRef } from 'react';

const ReactorLock = ({ onSetAngles }) => {
    const [angles, setAngles] = useState([0, 0, 0]); // Outer, Middle, Inner
    const rings = useRef([]);

    const handleStart = (e, index) => {
        // Prevent default only if it's not a touch event that might need standard processing?
        // Actually for a slider/knob, preventing default is usually good to stop scrolling.
        e.preventDefault();

        const ring = rings.current[index];
        const rect = ring.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Visual feedback
        ring.style.cursor = 'grabbing';
        ring.style.boxShadow = '0 0 15px var(--neon-blue)';

        const handleMove = (moveEvent) => {
            const clientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
            const clientY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;

            const deltaX = clientX - centerX;
            const deltaY = clientY - centerY;

            // Math execution
            let deg = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
            deg += 90; // Adjust for Top = 0

            if (deg < 0) deg += 360;

            setAngles(prev => {
                const newAngles = [...prev];
                newAngles[index] = Math.round(deg);
                if (onSetAngles) onSetAngles(newAngles);
                return newAngles;
            });
        };

        const handleEnd = () => {
            ring.style.cursor = 'grab';
            ring.style.boxShadow = 'none';

            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd);
    };

    return (
        <div className="reactor-container">
            <div className="target-marker"></div>
            <div className="target-label">0°</div>

            {/* Ring 1: Outer */}
            <div
                ref={el => rings.current[0] = el}
                id="ring-1"
                className="ring ring-outer"
                style={{ transform: `translate(-50%, -50%) rotate(${angles[0]}deg)` }}
                onMouseDown={(e) => handleStart(e, 0)}
                onTouchStart={(e) => handleStart(e, 0)}
            ></div>

            {/* Ring 2: Middle */}
            <div
                ref={el => rings.current[1] = el}
                id="ring-2"
                className="ring ring-middle"
                style={{ transform: `translate(-50%, -50%) rotate(${angles[1]}deg)` }}
                onMouseDown={(e) => handleStart(e, 1)}
                onTouchStart={(e) => handleStart(e, 1)}
            ></div>

            {/* Ring 3: Inner */}
            <div
                ref={el => rings.current[2] = el}
                id="ring-3"
                className="ring ring-inner"
                style={{ transform: `translate(-50%, -50%) rotate(${angles[2]}deg)` }}
                onMouseDown={(e) => handleStart(e, 2)}
                onTouchStart={(e) => handleStart(e, 2)}
            ></div>

            <div className={`core`} id="core-indicator"></div>
        </div>
    );
};

export default ReactorLock;
