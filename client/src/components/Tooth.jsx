import React from 'react';

const Tooth = ({ number, status, onClick, isSelected }) => {
    const getColor = (status) => {
        switch (status) {
            case 'Cavity': return '#ef4444';
            case 'Existing': return '#3b82f6';
            case 'Completed': return '#22c55e';
            case 'Extracted': return '#000000';
            default: return '#f3f4f6';
        }
    };

    const color = isSelected ? '#3b82f6' : getColor(status); // Blue if selected
    const stroke = isSelected ? '#1d4ed8' : '#4b5563';

    // Simple Shape Logic based on Universal Numbering
    // Incisors: 8,9, 7,10, 23,24, 25,26
    // Canines: 6,11, 22,27
    // Premolars: 4,5, 12,13, 20,21, 28,29
    // Molars: 1,2,3, 14,15,16, 17,18,19, 30,31,32

    const isIncisor = [8, 9, 7, 10, 23, 24, 25, 26].includes(number);
    const isCanine = [6, 11, 22, 27].includes(number);
    // Else Molar/Premolar logic (default wide shape)

    let pathD = "M 10,5 Q 20,0 30,5 Q 40,8 38,18 L 35,42 Q 20,50 5,42 L 2,18 Q 0,8 10,5 Z"; // Molar (Default)

    if (isIncisor) {
        // Rectangular
        pathD = "M 10,5 L 30,5 L 32,45 L 8,45 Z";
    } else if (isCanine) {
        // Pointy
        pathD = "M 10,10 L 20,0 L 30,10 L 28,45 L 12,45 Z";
    }

    return (
        <div className="flex flex-col items-center m-1 cursor-pointer" onClick={() => onClick(number)}>
            <div className={`transition-transform hover:scale-110 p-1 rounded ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                <svg width="40" height="50" viewBox="0 0 40 50">
                    <path
                        d={pathD}
                        fill={color}
                        stroke={stroke}
                        strokeWidth="2"
                    />
                    {status === 'Extracted' && (
                        <line x1="0" y1="0" x2="40" y2="50" stroke="red" strokeWidth="2" />
                    )}
                </svg>
            </div>
            <span className={`text-xs font-bold mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>{number}</span>
        </div>
    );
};

export default Tooth;
