import { Link, Outlet } from 'react-router-dom';

function Layout() {
    return (
        <div>
        <nav style={{ padding: '10px', background: '#f0f0f0' }}>
            <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
            <Link to="/about">About</Link>
        </nav>
        <main style={{ padding: '20px' }}>
            <Outlet />
        </main>
        </div>
    );
}

export default Layout;