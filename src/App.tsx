import { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import AdminInvitationList from './components/AdminInvitationList';
import AdminTemplateManager from './components/AdminTemplateManager';
import AdminUserManager from './components/AdminUserManager';
import CineLoveTraditionalInvitation from './components/CineLoveTraditionalInvitation';
import EmeraldInvitation from './components/EmeraldInvitationPage';
import HomePage from './components/HomePage';
import MainLayout from './components/MainLayout';
import RubyBasicInvitation from './components/RubyBasicInvitation';
import TemplateSelectorPage from './components/TemplateSelectorPage';
import TemplateDashboard from './components/TemplateDashboard';
import TemplateDashboard99k from './components/TemplateDashboard99k';
import WeddingInvitationManager from './components/WeddingInvitationManager';
import { authTokenService } from './services/auth-token.service';

function RequireAuth({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
    const user = authTokenService.getUser();

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (adminOnly && user.role !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/chon-mau/:packageKey" element={<TemplateSelectorPage />} />
                    <Route path="/dashboard" element={<RequireAuth><WeddingInvitationManager /></RequireAuth>} />
                    <Route path="/template-dashboard" element={<TemplateDashboard />} />
                    <Route path="/template-dashboard-99k" element={<TemplateDashboard99k />} />
                </Route>
                <Route path="/thiep-moi" element={<EmeraldInvitation />} />
                <Route path="/thiep-cuoi" element={<EmeraldInvitation />} />
                <Route path="/thiep-moi-99k" element={<RubyBasicInvitation />} />
                <Route path="/thiep-cuoi-99k" element={<RubyBasicInvitation />} />
                <Route path="/thiep-do-truyen-thong" element={<CineLoveTraditionalInvitation />} />
                <Route path="/admin-dashboard" element={<RequireAuth adminOnly><AdminDashboard /></RequireAuth>} />
                <Route path="/admin-orders" element={<RequireAuth adminOnly><AdminDashboard /></RequireAuth>} />
                <Route path="/admin-invitations" element={<RequireAuth adminOnly><AdminInvitationList /></RequireAuth>} />
                <Route path="/admin-payments" element={<RequireAuth adminOnly><AdminDashboard /></RequireAuth>} />
                <Route path="/admin-settings" element={<RequireAuth adminOnly><AdminDashboard /></RequireAuth>} />
                <Route path="/admin-templates" element={<RequireAuth adminOnly><AdminTemplateManager /></RequireAuth>} />
                <Route path="/admin-users" element={<RequireAuth adminOnly><AdminUserManager /></RequireAuth>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
