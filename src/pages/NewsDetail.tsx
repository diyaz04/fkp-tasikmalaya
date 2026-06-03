/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, User, ShieldAlert, Award, Clock, Share2, Download, Copy, Check, QrCode } from 'lucide-react';
import { dbService } from '@/src/lib/db';
import { Berita } from '@/src/types';

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [berita, setBerita] = useState<Berita | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentNews, setRecentNews] = useState<Berita[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [flyerUrl, setFlyerUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = window.location.href;

  const handleGenerateFlyer = async () => {
    if (!berita) return;
    setGenerating(true);
    setFlyerUrl(null);

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 840;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setGenerating(false);
      return;
    }

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      });
    };

    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=0f172a&bgcolor=ffffff&data=${encodeURIComponent(shareUrl)}`;
      const logoUrl = 'https://lh3.googleusercontent.com/d/1mJoucoBL-xS9gWnQYaaHcJ3hsumyG7Qb';
      
      const [newsImg, qrImg, logoImg] = await Promise.all([
        berita.thumbnail_url ? loadImage(berita.thumbnail_url).catch(() => null) : Promise.resolve(null),
        loadImage(qrUrl).catch(() => null),
        loadImage(logoUrl).catch(() => null)
      ]);

      // 1. Sleek Off-White/Light Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 600, 840);

      // Draw subtle light gradient glow on background
      const bgGrad = ctx.createRadialGradient(300, 300, 100, 300, 300, 500);
      bgGrad.addColorStop(0, '#f8fafc');
      bgGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 600, 840);

      // Top Modern Signature Gradient Line (website dynamic brand colors)
      const brandGrad = ctx.createLinearGradient(0, 0, 600, 0);
      brandGrad.addColorStop(0, '#2563eb'); // Royal Blue
      brandGrad.addColorStop(1, '#06b6d4'); // Vibrant Cyan
      ctx.fillStyle = brandGrad;
      ctx.fillRect(0, 0, 600, 8); // Thin top accent bar

      // 2. Elegant clean geometric touch (extremely subtle background watermark shapes)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.arc(600, 0, 200, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(37, 99, 235, 0.03)';
      ctx.lineWidth = 30;
      ctx.beginPath();
      ctx.arc(0, 840, 250, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Header Logo inside flyer
      if (logoImg) {
        // Draw the uploaded landscape rectangular logo with dynamic width based on height
        const logoHeight = 44;
        const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
        ctx.drawImage(logoImg, 45, 30, logoWidth, logoHeight);
      } else {
        // Fallback Dot emblem
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(60, 52, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('FORUM KEWIRAUSAHAAN PEMUDA', 76, 56);

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('KABUPATEN TASIKMALAYA • KABAR PINTAR DIGITAL', 76, 70);
      }

      // 4. White card with subtle shadow/border (glass-like overlay but clean white-slate base)
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;

      // Draw rounded rect helper
      const drawRoundedRect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
        c.beginPath();
        c.moveTo(x + r, y);
        c.arcTo(x + w, y, x + w, y + h, r);
        c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r);
        c.arcTo(x, y, x + w, y, r);
        c.closePath();
      };

      drawRoundedRect(ctx, 45, 105, 510, 530, 24);
      ctx.fill();
      ctx.stroke();

      // 5. Category Badge inside Card (using core brand gradient)
      ctx.fillStyle = brandGrad;
      drawRoundedRect(ctx, 75, 125, 140, 26, 8);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(berita.sumber === 'dpd' ? 'DPD KABUPATEN' : 'PK KECAMATAN', 145, 138);
      ctx.textAlign = 'left'; // reset text align
      ctx.textBaseline = 'alphabetic'; // reset baseline

      // 6. News Custom Image Area with Rounded Corners
      ctx.save();
      drawRoundedRect(ctx, 75, 165, 450, 200, 16);
      ctx.clip(); // clip drawing area to get rounded corners to match glass panel look

      if (newsImg) {
        // Draw image in cover scale mode (fill-and-center)
        const imgRatio = newsImg.width / newsImg.height;
        const targetRatio = 450 / 200;
        let sx = 0, sy = 0, sw = newsImg.width, sh = newsImg.height;
        
        if (imgRatio > targetRatio) {
          // Image is wider, crop left/right
          sw = newsImg.height * targetRatio;
          sx = (newsImg.width - sw) / 2;
        } else {
          // Image is taller, crop top/bottom
          sh = newsImg.width / targetRatio;
          sy = (newsImg.height - sh) / 2;
        }
        ctx.drawImage(newsImg, sx, sy, sw, sh, 75, 165, 450, 200);
      } else {
        // Fallback gradient if image fails to load or no image uploaded
        ctx.fillStyle = brandGrad;
        ctx.fillRect(75, 165, 450, 200);

        // draw background grid abstract geometric design
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        for (let i = 85; i < 515; i += 24) {
          ctx.fillRect(i, 165, 1, 200);
        }
      }
      ctx.restore(); // restore clip state to normal

      // Draw beautiful subtle layout border around image container
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      drawRoundedRect(ctx, 75, 165, 450, 200, 16);
      ctx.stroke();

      // Helper text wrapper
      const wrapText = (c: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = c.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            c.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        c.fillText(line, x, currentY);
        return currentY;
      };

      // 7. News Title (below the image)
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 18px sans-serif';
      const endY = wrapText(ctx, berita.judul, 75, 395, 450, 24);

      // 8. Contributor/Author & Date Info
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`Kontributor: ${berita.penulis}`, 75, endY + 28);
      
      // Separator line with brand gradient touches
      ctx.fillStyle = brandGrad;
      ctx.fillRect(75, endY + 36, 120, 2);

      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.fillText(`Diterbitkan: ${new Date(berita.created_at).toLocaleDateString('id-ID', { dateStyle: 'full' })}`, 75, endY + 54);

      // 9. Clean abstract/excerpt text
      const cleanContentExcerpt = (htmlText: string) => {
        const clean = htmlText.replace(/<\/?[^>]+(>|$)/g, "").trim();
        return clean.length > 150 ? clean.substring(0, 150) + '...' : clean;
      };

      ctx.fillStyle = '#334155';
      ctx.font = '12px sans-serif';
      const excerptText = cleanContentExcerpt(berita.konten);
      wrapText(ctx, excerptText, 75, endY + 80, 450, 18);

      // 10. Footer layout with QR Code and URL info
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      drawRoundedRect(ctx, 425, 680, 115, 115, 16);
      ctx.fill();
      ctx.stroke();

      // Left info block in footer (aligned with QR block)
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('PINDAI QR-CODE UNTUK BACA ONLINE', 45, 715);

      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.fillText('Forum Kewirausahaan Pemuda', 45, 735);
      ctx.fillText('Kabupaten Tasikmalaya', 45, 748);

      ctx.fillStyle = '#0284c7'; // elegant slate-blue link color
      ctx.font = 'bold 9px monospace';
      const displayUrl = shareUrl.length > 52 ? shareUrl.substring(0, 49) + '...' : shareUrl;
      ctx.fillText(displayUrl, 45, 770);

      if (qrImg) {
        ctx.drawImage(qrImg, 430, 685, 105, 105);
      } else {
        // Offline fallback for QR
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(430, 685, 105, 105);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[ FKP KAB ]', 482, 740);
        ctx.textAlign = 'left';
      }

      setFlyerUrl(canvas.toDataURL('image/png'));
      setGenerating(false);
    } catch (e) {
      console.error("Gagal menyusun flyer visual", e);
      setGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    async function loadData() {
      if (!id) return;
      try {
        const [targetBerita, allBeritas] = await Promise.all([
          dbService.getBeritaById(id),
          dbService.getBerita()
        ]);
        setBerita(targetBerita);
        setRecentNews(allBeritas.filter(b => b.status === 'published' && b.id !== id).slice(0, 3));
      } catch (error) {
        console.error("Gagal memuat berita detail", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-50 gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-cyan-500 animate-spin"></div>
        <p className="text-slate-500 font-semibold text-xs">Memuat detail artikel...</p>
      </div>
    );
  }

  if (!berita) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm text-center space-y-4">
        <ShieldAlert className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Artikel Tidak Ditemukan</h2>
        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
          Artikel yang Anda tuju mungkin sudah dihapus, di-draft ulang, atau URL artikel tersebut tidak valid.
        </p>
        <Link
          to="/berita"
          className="inline-block bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-6 py-2.5 rounded-full transition-colors"
        >
          Kembali ke Kabar FKP
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 font-sans" id="news-details-container">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <Link 
          to="/berita"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors mb-6 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Kabar & Artikel FKP
        </Link>

        {/* Core Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Article column */}
          <article className="lg:col-span-8 bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md">
            
            {/* Header Thumbnail image */}
            <div className="h-64 sm:h-[400px] w-full bg-slate-100 overflow-hidden relative">
              <img
                src={berita.thumbnail_url || "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80"}
                alt={berita.judul}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 bg-cyan-500 text-white text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full">
                {berita.sumber === 'dpd' ? 'DPD KABUPATEN' : 'PK KECAMATAN'}
              </div>
            </div>

            {/* Title, Metadata & Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="space-y-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
                  {berita.judul}
                </h1>
                
                {/* Meta details */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                      <span>{new Date(berita.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Penulis: {berita.penulis}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Terbit</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowShareModal(true);
                      handleGenerateFlyer();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-full text-xs font-extrabold shadow-md shadow-blue-500/10 hover:shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 mr-0.5" />
                    Bagikan Flyer Pintar
                  </button>
                </div>
              </div>

              {/* Body article content (Raw HTML processed beautifully) */}
              <div 
                className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-4 font-medium"
                dangerouslySetInnerHTML={{ __html: berita.konten }}
              ></div>

            </div>
          </article>


          {/* Right sidebar listing other items */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Promo banner */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-950 text-white p-6 rounded-2xl shadow-md space-y-4">
              <Award className="w-7 h-7 text-yellow-400" />
              <h4 className="text-base font-extrabold font-semibold">Aktifkan Diri Anda di Jaringan Wirausaha!</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                Tertarik mendaftarkan UMKM Anda atau berorganisasi di bawah naungan PK FKP Kabupaten Tasikmalaya? Hubungi kami langsung.
              </p>
              <Link
                to="/umkm"
                className="inline-block w-full text-center bg-cyan-500 text-slate-950 text-xs font-bold py-2.5 rounded-full hover:bg-cyan-400 transition-colors"
              >
                Mulai Berjejaring
              </Link>
            </div>

            {/* Recent list */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h4 className="text-xs font-bold text-slate-800 uppercase border-b border-slate-100 pb-3 mb-4 tracking-wider">Artikel Lainnya</h4>
              
              {recentNews.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold uppercase text-center py-4">Belum ada artikel tambahan</p>
              ) : (
                <div className="space-y-4">
                  {recentNews.map((rn) => (
                    <div 
                      key={rn.id}
                      onClick={() => navigate(`/berita/${rn.id}`)}
                      className="flex gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer group"
                    >
                      <img
                        src={rn.thumbnail_url || "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=150&q=80"}
                        alt={rn.judul}
                        className="w-16 h-16 object-cover rounded-xl shrink-0"
                      />
                      <div className="space-y-1 overflow-hidden">
                        <h5 className="text-xs font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors block truncate">
                          {rn.judul}
                        </h5>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          {new Date(rn.created_at).toLocaleDateString('id-ID', { dateStyle: 'short' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* MODAL POPUP: ULTRA MODERN SHARE SYSTEM */}
      {showShareModal && (
        <div 
          onClick={() => setShowShareModal(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-4 sm:p-4 z-50 overflow-y-auto animate-fade-in text-slate-800 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 border border-slate-100/10 relative cursor-default"
          >
            
            {/* Visual Pull line on handphone */}
            <div className="mx-auto w-12 h-1.5 bg-slate-200 rounded-full mb-1 sm:hidden shrink-0" />
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 gap-4">
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-950 uppercase tracking-tight">Kanal Berbagi Kabar</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Flyer Pintar &amp; Rapi dengan Kode QR</p>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-1.5 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                Tutup
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Dynamic Flyer Preview Render area */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-inner relative min-h-[360px]">
                {generating ? (
                  <div className="text-center space-y-3 p-6">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest animate-pulse">Menghasilkan Flyer...</p>
                  </div>
                ) : flyerUrl ? (
                  <div className="space-y-3 w-full text-center">
                    <div className="relative group overflow-hidden rounded-xl shadow-lg border border-slate-200/50 bg-slate-100 max-w-[245px] mx-auto hover:shadow-cyan-100 transition-all">
                      <img 
                        src={flyerUrl} 
                        alt="Kabar Flyer Pintar" 
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                        <span className="text-[10px] text-white font-extrabold uppercase tracking-widest border border-white/40 px-3 py-1.5 rounded-full">
                          Siap Dibagikan
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Poster Auto-Flyer HD (600 x 840 px)</p>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 space-y-2 p-6">
                    <QrCode className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-semibold">Gagal menyusun flyer visual secara instan.</p>
                  </div>
                )}
              </div>

              {/* Share actions block */}
              <div className="md:col-span-7 space-y-5">
                <div className="space-y-1.5 text-left">
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Detail Flyer & Kabar:</h4>
                  <p className="text-sm font-extrabold text-slate-800 leading-snug">{berita.judul}</p>
                  <p className="text-xs text-slate-400 font-semibold line-clamp-3">
                    Brosur digital ini dirancang dengan gradasi dinamis modern, memuat summary artikel resmi, metadata kontributor dari wilayah, serta QRCode yang langsung terintegrasi ke tautan URL aktif.
                  </p>
                </div>

                <div className="h-[1px] bg-slate-100"></div>

                <div className="flex flex-col gap-2.5">
                  {flyerUrl && (
                    <a
                      href={flyerUrl}
                      download={`Flyer_FKP_${berita.judul.replace(/\s+/g, '_')}.png`}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-95 text-center"
                    >
                      <Download className="w-4 h-4" />
                      Unduh Gambar Flyer (Flayer PNG)
                    </a>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          Tersalin!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Salin Tautan
                        </>
                      )}
                    </button>

                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Ada kabar penting dari Forum Kewirausahaan Pemuda (FKP): *' + berita.judul + '*. Baca rilis rincian berita selengkapnya langsung di sini: ' + shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl transition-all hover:scale-[1.02] active:scale-95 cursor-pointer text-center"
                    >
                      <span>Share WA</span>
                    </a>
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-700 font-semibold space-y-1">
                  <p className="font-extrabold uppercase tracking-wide">💡 Tips Posting Kreatif:</p>
                  <p className="leading-relaxed">
                    Setelah mengunduh Flayer Gambar PNG di atas, Anda bisa langsung membagikannya atau memasangnya sebagai Story/Status WhatsApp &amp; Instagram Anda. Pengikut cukup scan kode QR di gambar untuk membaca rilis lengkapnya!
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
