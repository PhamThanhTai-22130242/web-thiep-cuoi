import { ArrowLeft, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './NotFoundPage.css';

type NotFoundPageProps = {
    code?: string;
    title?: string;
};

function NotFoundPage({
    code = '404',
    title = 'Không tìm thấy trang',
}: NotFoundPageProps) {
    const navigate = useNavigate();

    return (
        <main className="not-found-page">
            <section className="not-found-hero" aria-labelledby="not-found-title">
                <h1 id="not-found-title">{code}</h1>
                <h2>{title}</h2>

                <div className="not-found-actions">
                    <Link to="/" className="not-found-primary">
                        <Home size={18} />
                        Về trang chủ
                    </Link>
                    <button type="button" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                        Quay lại
                    </button>
                </div>
            </section>
        </main>
    );
}

export default NotFoundPage;
