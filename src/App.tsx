import React from 'react';
import MinimalistPortfolio from './components/MinimalistPortfolio';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 relative overflow-x-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <MinimalistPortfolio />
      </div>
    </div>
  );
}

export default App;