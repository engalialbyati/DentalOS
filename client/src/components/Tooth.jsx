import React from 'react';

const Tooth = ({ number, status, onClick }) => {
    const getColor = (status) => {
        switch (status) {
            case 'Cavity': return '#ef4444'; // Red-500
            case 'Existing': return '#3b82f6'; // Blue-500
            case 'Completed': return '#22c55e'; // Green-500
            case 'Extracted': return '#000000'; // Black (or missing)
            default: return '#f3f4f6'; // Gray-100 (White-ish)
        }
    };

    const color = getColor(status);

    // Simple stylized tooth path (abstract representation)
    // M 10,2 Q 20,0 30,2 Q 40,5 38,15 L 35,40 Q 20,50 5,40 L 2,15 Q 0,5 10,2 Z
    // This is a rough "molar" shape.

    return (
        <div className="flex flex-col items-center m-1 cursor-pointer" onClick={() => onClick(number)}>
            <svg width="40" height="50" viewBox="0 0 40 50" className="transition-transform hover:scale-110">
                <path
                    d="M 10,5 Q 20,0 30,5 Q 40,8 38,18 L 35,42 Q 20,50 5,42 L 2,18 Q 0,8 10,5 Z"
                    fill={color}
                    stroke="#4b5563"
                    strokeWidth="2"
                />
                {status === 'Extracted' && (
                    <line x1="0" y1="0" x2="40" y2="50" stroke="red" strokeWidth="2" />
                )}
            </svg>
            <span className="text-xs font-bold mt-1">{number}</span>
        </div>
    );
};

export default Tooth;
