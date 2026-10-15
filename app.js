/**
 * SandRose - Luxury Single-Page Brochure Engine
 * Features:
 * - 1-Week (7 Days) Live Precision Countdown
 * - High-Res Single Page Brochure PNG Downloader via HTML5 Canvas
 * - VIP Early Access Reservation
 * - Lucide Icon Initializer
 */

function startApp() {
    initOneWeekTimer();
    initBrochureDownload();
    initNotifyForm();

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

/* ==========================================================================
   1. 7-DAY LIVE COUNTDOWN TIMER
   ========================================================================== */
function initOneWeekTimer() {
    const STORAGE_KEY = 'sandrose_7day_timer_target';
    let targetTime = localStorage.getItem(STORAGE_KEY);

    if (!targetTime) {
        const now = new Date();
        now.setDate(now.getDate() + 7);
        targetTime = now.getTime();
        localStorage.setItem(STORAGE_KEY, targetTime);
    } else {
        targetTime = parseInt(targetTime, 10);
    }

    const daysEl = document.getElementById('timer-days');
    const hoursEl = document.getElementById('timer-hours');
    const minutesEl = document.getElementById('timer-minutes');
    const secondsEl = document.getElementById('timer-seconds');

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetTime - now;

        if (distance <= 0) {
            if (daysEl) daysEl.textContent = '00';
            if (hoursEl) hoursEl.textContent = '00';
            if (minutesEl) minutesEl.textContent = '00';
            if (secondsEl) secondsEl.textContent = '00';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

/* ==========================================================================
   2. DOWNLOAD SINGLE PAGE BROCHURE VIA CANVAS
   ========================================================================== */
function initBrochureDownload() {
    const downloadBtn = document.getElementById('download-brochure-btn');
    if (!downloadBtn) return;

    downloadBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1100;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');

        // Dark Luxury Rosewood folio background
        const grad = ctx.createLinearGradient(0, 0, 1100, 720);
        grad.addColorStop(0, '#1c0c0a');
        grad.addColorStop(0.5, '#0e0706');
        grad.addColorStop(1, '#24100e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1100, 720);

        // Gold Foil Border
        ctx.strokeStyle = '#e5b869';
        ctx.lineWidth = 4;
        ctx.strokeRect(30, 30, 1040, 660);

        ctx.strokeStyle = 'rgba(229, 184, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(42, 42, 1016, 636);

        // Title
        ctx.fillStyle = '#e5b869';
        ctx.font = 'bold 44px "Playfair Display", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('SandRose', 550, 110);

        ctx.fillStyle = 'rgba(255, 235, 195, 0.85)';
        ctx.font = '14px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('PREMIUM WOODEN GIFTING • OFFICIAL ATELIER BROCHURE', 550, 145);

        // Divider
        ctx.beginPath();
        ctx.moveTo(380, 165);
        ctx.lineTo(720, 165);
        ctx.strokeStyle = 'rgba(229, 184, 105, 0.4)';
        ctx.stroke();

        ctx.textAlign = 'left';

        // Atelier Pillars
        ctx.fillStyle = '#e5b869';
        ctx.font = 'bold 16px "Playfair Display", serif';
        ctx.fillText('THE ESSENCE OF THE ATELIER:', 80, 230);

        ctx.fillStyle = '#e5b869';
        ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('• SACRED MYSORE SANDALWOOD (Santalum album)', 80, 275);
        ctx.fillStyle = '#d4c8b8';
        ctx.font = '14px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('  40-year matured heartwood. Rich in natural calming santalol oils with decades-long aroma.', 80, 300);

        ctx.fillStyle = '#e5b869';
        ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('• IMPERIAL INDIAN ROSEWOOD (Dalbergia latifolia)', 80, 355);
        ctx.fillStyle = '#d4c8b8';
        ctx.font = '14px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('  Hypnotic crimson veins, heirloom density, and resonant acoustic harmonics with mirror luster.', 80, 380);

        ctx.fillStyle = '#e5b869';
        ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('• LIMITED BATCH 001 HEIRLOOM ALLOCATION', 80, 435);
        ctx.fillStyle = '#d4c8b8';
        ctx.font = '14px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('  Handcrafted serialized editions accompanied by a certificate of botanical provenance.', 80, 460);

        // Botanical footer
        ctx.fillStyle = '#e5b869';
        ctx.font = '12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('CERTIFIED WOOD PROVENANCE: Santalum album (Sandalwood) & Dalbergia latifolia (Rosewood)', 80, 520);
        ctx.fillStyle = '#8e8171';
        ctx.fillText('BATCH 001 LIMITED ALLOCATION • OFFICIAL REVEAL IN 7 DAYS', 80, 545);

        // Seal
        ctx.strokeStyle = 'rgba(229, 184, 105, 0.4)';
        ctx.beginPath();
        ctx.arc(920, 360, 65, 0, Math.PI * 2);
        ctx.stroke();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#e5b869';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('AUTHENTIC', 920, 355);
        ctx.fillText('HEIRLOOMS', 920, 372);

        const link = document.createElement('a');
        link.download = 'SandRose_Official_Brochure.png';
        link.href = canvas.toDataURL('image/png');
        link.click();

        if (typeof confetti === 'function') {
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.7 },
                colors: ['#e5b869', '#d6a354', '#8a2323']
            });
        }
    });
}

/* ==========================================================================
   3. VIP NOTIFY FORM
   ========================================================================== */
function initNotifyForm() {
    const form = document.getElementById('notify-form');
    const input = document.getElementById('notify-email');
    const feedback = document.getElementById('notify-feedback');

    if (form && input) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = input.value.trim();
            if (!email) return;

            localStorage.setItem('sandrose_vip_email', email);
            input.value = '';

            if (feedback) {
                feedback.textContent = "✦ You have reserved VIP Priority Access for Batch 001. A confidential invite will be sent to your inbox.";
                feedback.classList.add('show');
            }

            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 60,
                    spread: 80,
                    origin: { y: 0.8 },
                    colors: ['#e6b85c', '#d6a354', '#8a2323']
                });
            }
        });
    }
}
