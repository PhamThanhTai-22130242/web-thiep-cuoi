import { ReactNode, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import AdminInvitationList from './components/AdminInvitationList';
import AdminTemplateManager from './components/AdminTemplateManager';
import AdminUserManager from './components/AdminUserManager';
import CoDienInvitation from './components/CoDienInvitation';
import HomePage from './components/HomePage';
import MainLayout from './components/MainLayout';
import MyWeddingCardPreviewPage from './components/MyWeddingCardPreviewPage';
import NotFoundPage from './components/NotFoundPage';
import PublicCommentManagerPage from './components/PublicCommentManagerPage';
import PublicWeddingCardPage from './components/PublicWeddingCardPage';
import TemplateSelectorPage from './components/TemplateSelectorPage';
import TestComponent from './components/TestComponent';
import WeddingInvitationManager from './components/WeddingInvitationManager';
import { weddingTemplateConfigs } from './data/weddingTemplateRegistry';
import { authTokenService } from './services/auth-token.service';

function RequireAuth({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) {
    const user = authTokenService.getUser();

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const redirectPath = user.role === 'SUPPORT' ? '/admin-invitations' : '/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
}

function App() {
    // useEffect(() => {
    //     const handleContextMenu = (e: MouseEvent) => {
    //         e.preventDefault();
    //     };

    //     const handleKeyDown = (e: KeyboardEvent) => {
    //         // Chặn F12
    //         if (e.key === 'F12') {
    //             e.preventDefault();
    //             return;
    //         }
    //         // Chặn Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (và Cmd trên Mac)
    //         if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
    //             e.preventDefault();
    //             return;
    //         }
    //         // Chặn Alt+Cmd+I, Alt+Cmd+J, Alt+Cmd+C (Mac DevTools)
    //         if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
    //             e.preventDefault();
    //             return;
    //         }
    //         // Chặn Ctrl+U / Cmd+U (Xem mã nguồn)
    //         if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
    //             e.preventDefault();
    //             return;
    //         }
    //         // Chặn Ctrl+S / Cmd+S (Lưu trang)
    //         if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
    //             e.preventDefault();
    //             return;
    //         }
    //     };

    //     document.addEventListener('contextmenu', handleContextMenu);
    //     document.addEventListener('keydown', handleKeyDown);

    //     return () => {
    //         document.removeEventListener('contextmenu', handleContextMenu);
    //         document.removeEventListener('keydown', handleKeyDown);
    //     };
    // }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/chon-mau/:packageKey" element={<TemplateSelectorPage />} />
                    <Route path="/dashboard" element={<RequireAuth><WeddingInvitationManager /></RequireAuth>} />
                    <Route path="/quan-li-binh-luan" element={<PublicCommentManagerPage />} />
                    <Route path="/quan-li-binh-luan/:slug" element={<PublicCommentManagerPage />} />
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
                <Route path="/test-fabric" element={<TestComponent />} />
                <Route path="/CODIEN" element={<CoDienInvitation />} />
                <Route path="/thiep/:slug" element={<PublicWeddingCardPage />} />
                <Route path="/preview-wedding-card/:weddingId" element={<RequireAuth><MyWeddingCardPreviewPage /></RequireAuth>} />
                <Route path="/admin-dashboard" element={<RequireAuth allowedRoles={['ADMIN']}><AdminDashboard /></RequireAuth>} />
                <Route path="/admin-invitations" element={<RequireAuth allowedRoles={['ADMIN', 'SUPPORT']}><AdminInvitationList /></RequireAuth>} />
                <Route path="/admin-settings" element={<RequireAuth allowedRoles={['ADMIN']}><AdminDashboard /></RequireAuth>} />
                <Route path="/admin-templates" element={<RequireAuth allowedRoles={['ADMIN']}><AdminTemplateManager /></RequireAuth>} />
                <Route path="/admin-users" element={<RequireAuth allowedRoles={['ADMIN']}><AdminUserManager /></RequireAuth>} />
                <Route path="/401" element={<NotFoundPage code="401" title="Bạn không có quyền truy cập trang này" />} />
                <Route path="/500" element={<NotFoundPage code="500" title={'H\u1ec7 th\u1ed1ng \u0111ang g\u1eb7p s\u1ef1 c\u1ed1'} />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
