import React from 'react';

export function SimpleTest() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'green', 
      color: 'white', 
      border: '2px solid black',
      margin: '20px'
    }}>
      <h1>🎯 SIMPLE TEST COMPONENT</h1>
      <p>✅ If you can see this, React is working!</p>
      <p>⏰ Time: {new Date().toLocaleTimeString()}</p>
      <p>🔧 Build Status: SUCCESS</p>
      <p>📱 Component Rendering: ACTIVE</p>
    </div>
  );
}
