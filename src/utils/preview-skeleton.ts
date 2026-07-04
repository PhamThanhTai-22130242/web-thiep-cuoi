export const previewSkeletonDocument = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Đang tạo bản xem trước</title>
<style>
body{margin:0;font-family:Inter,system-ui,sans-serif;background:#f8f8f1;color:#2d4b45}
.preview-skeleton{min-height:100vh;padding:clamp(28px,5vw,72px) 18px;background:radial-gradient(circle at 50% 0,rgba(194,161,19,.12),transparent 32vh),linear-gradient(90deg,rgba(45,75,69,.04) 1px,transparent 1px),#f8f8f1;background-size:auto,32px 32px,auto}
.preview-skeleton__hero,.preview-skeleton__card{width:min(100%,960px);margin:0 auto}
.preview-skeleton__hero{display:grid;grid-template-columns:minmax(120px,220px) minmax(220px,1fr) minmax(120px,220px);align-items:center;gap:clamp(18px,4vw,42px);min-height:360px}
.skel{position:relative;overflow:hidden;background:rgba(45,75,69,.1);border-radius:18px}
.skel:after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);animation:shimmer 1.35s ease-in-out infinite}
.photo{aspect-ratio:3/4;box-shadow:0 18px 48px rgba(32,59,54,.12)}
.photo:first-child{transform:rotate(-5deg)}.photo:last-child{transform:rotate(5deg)}
.content{display:grid;justify-items:center;gap:16px}.pill{width:min(54%,220px);height:18px;border-radius:999px}.title{width:min(82%,420px);height:clamp(56px,8vw,92px);border-radius:28px}.line{width:min(72%,360px);height:16px;border-radius:999px}.line.is-short{width:min(58%,280px)}
.preview-skeleton__card{display:grid;justify-items:center;gap:18px;margin-top:clamp(16px,4vw,48px);padding:clamp(28px,5vw,48px);border:1px solid rgba(45,75,69,.12);border-radius:28px;background:rgba(255,255,255,.48);box-shadow:0 24px 60px rgba(32,59,54,.1)}
.card-line{width:min(72%,520px);height:18px;border-radius:999px}.card-line.is-title{width:min(46%,300px);height:42px;border-radius:20px}.date{display:grid;grid-template-columns:110px 92px 110px;align-items:center;gap:18px}.date .skel{height:36px}.date strong.skel{display:block;height:88px;border-radius:24px}
@keyframes shimmer{100%{transform:translateX(100%)}}
@media(max-width:760px){.preview-skeleton__hero{grid-template-columns:1fr;min-height:auto}.photo{width:min(62vw,220px);margin:0 auto}.photo:last-child{display:none}.date{grid-template-columns:1fr;width:min(100%,240px)}}
</style>
</head>
<body>
<main class="preview-skeleton" aria-busy="true">
<section class="preview-skeleton__hero" role="status" aria-label="Đang tạo bản xem trước">
<div class="skel photo"></div><div class="content"><div class="skel pill"></div><div class="skel title"></div><div class="skel line"></div><div class="skel line is-short"></div></div><div class="skel photo"></div>
</section>
<section class="preview-skeleton__card"><div class="skel card-line"></div><div class="skel card-line is-title"></div><div class="date"><span class="skel"></span><strong class="skel"></strong><span class="skel"></span></div><div class="skel card-line"></div></section>
</main>
</body>
</html>`;
