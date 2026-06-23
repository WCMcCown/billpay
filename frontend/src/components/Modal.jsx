import { useEffect, useRef } from "react";

export default function Modal({ onClose, children }) {
    const cardRef = useRef(null);

    // Close on ESC
    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Escape") onClose(null);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    // Close on click outside
    const handleBackdropClick = (e) => {
        if (cardRef.current && !cardRef.current.contains(e.target)) {
            onClose(null);
        }
    };

    return (
        <div className="modal-backdrop" onMouseDown={handleBackdropClick}>
            <div className="modal-card" ref={cardRef}>
                {children}
            </div>
        </div>
    );
}
