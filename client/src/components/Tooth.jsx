import React from 'react';

const colorFor = (status, selected) => {
    if (selected) return { fill: '#1f8da5', stroke: '#177087' };
    switch (status) {
        case 'Cavity': return { fill: '#fca5a5', stroke: '#ef4444' };
        case 'Existing': return { fill: '#bfdbfe', stroke: '#3b82f6' };
        case 'Completed': return { fill: '#bbf7d0', stroke: '#22c55e' };
        case 'Extracted': return { fill: '#e2e8f0', stroke: '#64748b' };
        default: return { fill: '#ffffff', stroke: '#cbd5e1' };
    }
};

const Tooth = ({ number, status, onClick, isSelected }) => {
    const { fill, stroke } = colorFor(status, isSelected);
    const isIncisor = [8, 9, 7, 10, 23, 24, 25, 26].includes(number);
    const isCanine = [6, 11, 22, 27].includes(number);

    let pathD = 'M 10,5 Q 20,0 30,5 Q 40,8 38,18 L 35,42 Q 20,50 5,42 L 2,18 Q 0,8 10,5 Z';
    if (isIncisor) pathD = 'M 10,5 L 30,5 L 32,45 L 8,45 Z';
    else if (isCanine) pathD = 'M 10,10 L 20,0 L 30,10 L 28,45 L 12,45 Z';

    return (
        <div className="flex flex-col items-center m-0.5 cursor-pointer select-none group" onClick={() => onClick(number)}>
            <div className={`transition-transform group-hover:scale-110 ${isSelected ? 'drop-shadow' : ''}`}>
                <svg width="34" height="44" viewBox="0 0 40 50">
                    <path d={pathD} fill={fill} stroke={stroke} strokeWidth="2" />
                    {status === 'Extracted' && <line x1="0" y1="0" x2="40" y2="50" stroke="#ef4444" strokeWidth="2.5" />}
                </svg>
            </div>
            <span className={`text-[11px] font-bold mt-0.5 ${isSelected ? 'text-brand-600' : 'text-slate-500'}`}>{number}</span>
        </div>
    );
};

export default Tooth;
