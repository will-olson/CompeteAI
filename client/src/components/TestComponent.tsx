import React from 'react';

export function TestComponent() {
  return (
    <div className="p-4 bg-blue-100 border border-blue-300 rounded">
      <h2 className="text-lg font-bold text-blue-800">Test Component</h2>
      <p className="text-blue-600">If you can see this, React is working!</p>
      <p className="text-sm text-blue-500">Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}
