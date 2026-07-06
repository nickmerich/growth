import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import EventManage from './pages/EventManage.jsx';
import TimingStation from './pages/TimingStation.jsx';
import EventJoin from './pages/EventJoin.jsx';
import AthleteTimer from './pages/AthleteTimer.jsx';
import Scoreboard from './pages/Scoreboard.jsx';
import Result from './pages/Result.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/event/:slug" element={<EventManage />} />
      <Route path="/admin/time/:slug" element={<TimingStation />} />
      <Route path="/event/:slug" element={<EventJoin />} />
      <Route path="/timer/:slug" element={<AthleteTimer />} />
      <Route path="/scoreboard/:slug" element={<Scoreboard />} />
      <Route path="/result/:id" element={<Result />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
