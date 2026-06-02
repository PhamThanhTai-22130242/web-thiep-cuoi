import { Outlet, useLocation } from 'react-router-dom';
import './MainLayout.css';
import SiteHeader from './SiteHeader';

function MainLayout() {
    const location = useLocation();
    const showHeader = location.pathname !== '/';
    const isSelectorPage = location.pathname.startsWith('/chon-mau');
    const isEditorPage = location.pathname.endsWith('/edit');

    return (
        <div className={[
            'main-layout',
            showHeader ? 'main-layout-with-header' : '',
            isSelectorPage ? 'main-layout-selector' : '',
            isEditorPage ? 'main-layout-editor' : '',
        ].filter(Boolean).join(' ')}>
            {showHeader && <SiteHeader />}
            <Outlet key={location.pathname} />
        </div>
    );
}

export default MainLayout;
