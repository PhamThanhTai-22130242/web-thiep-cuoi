import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from './SiteHeader';

function MainLayout() {
    const location = useLocation();
    const showHeader = location.pathname !== '/';

    return (
        <>
            {showHeader && <SiteHeader />}
            <Outlet />
        </>
    );
}

export default MainLayout;
