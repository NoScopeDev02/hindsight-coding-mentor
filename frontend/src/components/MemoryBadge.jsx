import React from 'react';

const MemoryBadge = ({ active }) => {
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all duration-500 ${
      active 
        ? 'bg-hindsight-green text-dark-900 shadow-glow-green' 
        : 'bg-dark-700 text-gray-400'
    }`}>
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-dark-900 animate-pulse' : 'bg-gray-500'}`}></div>
      {active ? 'MEMORY RECALLED' : 'NO MEMORY'}
    </div>
  );
};

export default MemoryBadge;
