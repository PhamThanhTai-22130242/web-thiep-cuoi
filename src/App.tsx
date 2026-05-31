import { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import AdminInvitationList from './components/AdminInvitationList';
import AdminTemplateManager from './components/AdminTemplateManager';
import AdminUserManager from './components/AdminUserManager';
import HomePage from './components/HomePage';
import MainLayout from './components/MainLayout';
import TemplateSelectorPage from './components/TemplateSelectorPage';
import WeddingInvitationManager from './components/WeddingInvitationManager';
import { weddingTemplateConfigs } from './data/weddingTemplateRegistry';
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
                    {weddingTemplateConfigs.flatMap((template) => {
                        if (!template.editorComponent) {
                            return [];
                        }

                        const EditorComponent = template.editorComponent;

                        return [template.editorPath, ...template.legacyEditorPaths].map((path) => (
                            <Route key={`editor-${template.code}-${path}`} path={path} element={<EditorComponent />} />
                        ));
                    })}
                </Route>
                {weddingTemplateConfigs.flatMap((template) => {
                    const DisplayComponent = template.displayComponent;

                    return [template.previewPath, ...template.legacyPreviewPaths].map((path) => (
                        <Route key={`preview-${template.code}-${path}`} path={path} element={<DisplayComponent />} />
                    ));
                })}
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
