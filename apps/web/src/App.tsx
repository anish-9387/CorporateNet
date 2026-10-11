import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { Overview } from './pages/Overview';
import { Topology } from './pages/Topology';
import { VLSMStudio } from './pages/VLSMStudio';
import { Routing } from './pages/Routing';
import { Diagnostics } from './pages/Diagnostics';
import { Scenarios } from './pages/Scenarios';
import { Reports } from './pages/Reports';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/topology" element={<Topology />} />
        <Route path="/vlsm" element={<VLSMStudio />} />
        <Route path="/routing" element={<Routing />} />
        <Route path="/diagnostics" element={<Diagnostics />} />
        <Route path="/scenarios" element={<Scenarios />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App;