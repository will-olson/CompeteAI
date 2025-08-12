import React from 'react';
import { SimpleTest } from "@/components/SimpleTest";

const Index = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🚀 INDEX PAGE - REACT TEST</h1>
      <SimpleTest />
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p>📋 This is a simplified test page to verify React rendering</p>
        <p>🔗 Navigation to other pages will be restored once basic functionality is confirmed</p>
      </div>
    </div>
  );
};

export default Index;
