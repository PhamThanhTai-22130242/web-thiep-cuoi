import './ImperialWeddingInvitation.css';

const coupleImage =
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80';

function ImperialWeddingInvitation() {
    return (
        <main className="iwi-page">
            <section className="iwi-card">
                <header className="iwi-header">
                    <p>WEDDING INVITATION</p>
                    <h1>THIỆP MỜI CƯỚI</h1>
                    <span className="iwi-mark" aria-hidden="true" />
                </header>

                <div className="iwi-couple-names" aria-label="Tên cô dâu chú rể">
                    <span>Quốc Huy</span>
                    <span>Mai Anh</span>
                </div>

                <section className="iwi-envelope-section">
                    <div className="iwi-envelope-top" aria-hidden="true" />

                    <figure className="iwi-photo-card">
                        <img src={coupleImage} alt="Ảnh cưới Mai Anh và Quốc Huy" />
                    </figure>

                    <div className="iwi-envelope-body" aria-hidden="true">
                        <div className="iwi-envelope-left" />
                        <div className="iwi-envelope-right" />
                        <div className="iwi-envelope-flap" />
                        <div className="iwi-seal">MA</div>
                    </div>
                </section>

                <section className="iwi-ceremony-title" aria-label="Lễ thành hôn">
                    <span />
                    <h2>LỄ THÀNH HÔN</h2>
                    <span />
                </section>

                <section className="iwi-couple-script">
                    <p>Phạm Xuân Huy</p>
                    <span>&amp;</span>
                    <p>Nguyễn Mai Anh</p>
                </section>

                <section className="iwi-date-block" aria-label="Thông tin ngày lễ thành hôn">
                    <div className="iwi-date-block__heading">
                        <span />
                        <p className="iwi-date-block__title">TIỆC MỪNG</p>
                        <span />
                    </div>
                    <p className="iwi-date-block__subtitle">
                        VÀO LÚC <span className="iwi-time-plain">10:30</span> THỨ NĂM
                    </p>

                    <div className="iwi-date-block__row">
                        <p>
                            THÁNG <span className="iwi-date-fixed-num">12</span>
                        </p>
                        <strong>15</strong>
                        <p>
                            NĂM <span className="iwi-date-fixed-num">2026</span>
                        </p>
                    </div>

                    <p className="iwi-date-block__lunar">(Tức ngày 17 tháng 11 âm Bính Ngọ)</p>
                </section>

            </section>
        </main>
    );
}

export default ImperialWeddingInvitation;
