import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { Overview } from './pages/Overview';
import { Topology } from './pages/Topology';
import { Presentation } from './pages/Presentation';
import { VLSMStudio } from './pages/VLSMStudio';
import { Architecture } from './pages/Architecture';
import { DeviceGuide } from './pages/DeviceGuide';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/simulation" element={<Presentation />} />
        <Route path="/topology" element={<Topology />} />
        <Route path="/device-guide" element={<DeviceGuide />} />
        <Route path="/vlsm" element={<VLSMStudio />} />
        <Route path="/architecture" element={<Architecture />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;