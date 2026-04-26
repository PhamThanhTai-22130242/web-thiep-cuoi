import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import EmeraldInvitation from './components/EmeraldInvitationPage';
import HomePage from './components/HomePage';
import ImperialWeddingInvitation from './components/ImperialWeddingInvitation';
import MainLayout from './components/MainLayout';
import RubyBasicInvitation from './components/RubyBasicInvitation';
import TemplateSelectorPage from './components/TemplateSelectorPage';
import TemplateDashboard from './components/TemplateDashboard';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/chon-mau/:packageKey" element={<TemplateSelectorPage />} />
                    <Route path="/dashboard" element={<TemplateDashboard />} />
                </Route>
                <Route path="/thiep-moi" element={<EmeraldInvitation />} />
                <Route path="/thiep-moi-99k" element={<RubyBasicInvitation />} />
                <Route path="/thiep-do-truyen-thong" element={<ImperialWeddingInvitation />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
