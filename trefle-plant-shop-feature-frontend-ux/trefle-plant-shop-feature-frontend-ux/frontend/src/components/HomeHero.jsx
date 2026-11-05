// # ส่วนแนะนำและค้นหาต้นไม้บนหน้าแรก รับสถานะและตัวจัดการจาก HomePage
export default function HomeHero({
    query,
    searchViewActive,
    onQueryChange,
    onSearch,
    onClearSearch
}) {
    return (
        <section className="hero">
            {/* # วิดีโอพื้นหลังตกแต่ง ไม่รับการโต้ตอบจากผู้ใช้ */}
            <video className="hero-video" autoPlay muted loop playsInline aria-hidden="true">
                <source
                    src="/Cows_grazing_on_green_hills_1080p_20261024124512.mp4"
                    type="video/mp4"
                />
            </video>
            {/* # ข้อความแนะนำและแบบฟอร์มค้นหา */}
            <div className="hero-content">
                <span className="eyebrow">🌱 PLANT EXPLORER</span>
                <h2>Find a plant<br /><span>you&apos;ll love.</span></h2>
                <p>
                    Explore plant information, discover new species, and save your favorites.
                </p>
                <form className="search-box" onSubmit={onSearch}>
                    <input
                        type="search"
                        value={query}
                        onChange={event => onQueryChange(event.target.value)}
                        placeholder="Search plants..."
                        aria-label="Search plants"
                    />
                    <button className="primary-button" type="submit">Search</button>
                    {(query || searchViewActive) && (
                        <button
                            className="clear-search-button"
                            type="button"
                            onClick={onClearSearch}
                        >
                            Clear search
                        </button>
                    )}
                </form>
            </div>
            {/* # องค์ประกอบตกแต่งด้านข้างของส่วนแนะนำ */}
            <div className="hero-decoration" aria-hidden="true">
                <div className="leaf-circle">🌿</div>
            </div>
        </section>
    );
}
