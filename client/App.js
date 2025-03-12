import React from 'react';
import MetricSelector from './components/MetricSelector';
import FinancialChatInterface from './components/FinancialChatInterface';

function App() {
  const [selectedMetrics, setSelectedMetrics] = React.useState([]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Financial Insights Components</h1>
      
      <MetricSelector 
        onMetricsSelected={(metrics) => {
          console.log('Selected Metrics:', metrics);
          setSelectedMetrics(metrics);
        }} 
      />

      {selectedMetrics.length > 0 && (
        <FinancialChatInterface 
          selectedMetrics={selectedMetrics} 
        />
      )}
    </div>
  );
}

export default App;