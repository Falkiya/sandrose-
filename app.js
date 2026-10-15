/**
 * SandRose - Single Page Brochure Experience Engine
 * Features:
 * - 1-Week (7 Days) Live Precision Countdown
 * - 3D Box Unbox Ceremony: 360° Spin, Fog Spread, Glitters & Mini Gift Boxes
 * - Single-Page Brochure Display on Box Click with smooth Up-Down Scrollability
 * - High-Res Single Page Brochure PNG Downloader via Canvas
 * - Luxury Web Audio Chimes
 */

let soundEnabled = true;

// Web Audio API Synthesizer
class LuxuryAudioEngine {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playChord(freqs, type = 'sine', duration = 1.4, gainLevel = 0.1) {
        if (!soundEnabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);

            gain.gain.setValueAtTime(0.001, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(gainLevel / freqs.length, now + idx * 0.05 + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + idx * 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.05);
            osc.stop(now + duration + idx * 0.05 + 0.1);
        });
    }

    playOpen() {
        this.playChord([329.63, 415.30, 493.88, 659.25, 830.61, 987.77], 'sine', 2.2, 0.16);
    }

    playClose() {
        this.playChord([220.00, 277.18, 329.63], 'triangle', 0.6, 0.08);
    }
}

const audioEngine = new LuxuryAudioEngine();

document.addEventListener('DOMContentLoaded', () => {
    initOneWeekTimer();
    initBrochureModalControls();
    initBrochureDownload();
    initSoundToggle();
    initCustomCursor();
    initNotifyForm();

    if (window.lucide) {
        window.lucide.createIcons();
    }
});

/* ==========================================================================
   1. 7-DAY COUNTDOWN TIMER
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
   2. SINGLE PAGE BROCHURE MODAL ORCHESTRATION
   ========================================================================== */
function initBrochureModalControls() {
    const modalEl = document.getElementById('brochure-modal');
    const fogEl = document.getElementById('mystic-fog-container');
    const hintPill = document.getElementById('giftbox-prompt-pill');
    const closeBtn = document.getElementById('close-brochure-btn');
    const bottomResealBtn = document.getElementById('bottom-reseal-btn');
    const openBrochureNavBtn = document.getElementById('open-brochure-nav-btn');

    // Called automatically when the 3D box is clicked/opened
    window.onSandRoseBoxOpened = function () {
        if (fogEl) {
            fogEl.classList.add('active');
        }

        audioEngine.playOpen();

        if (hintPill) {
            hintPill.classList.add('hidden');
        }

        // Open the Single Page Brochure after the box completes its 360 rotation & mini boxes burst
        setTimeout(() => {
            if (modalEl) {
                modalEl.classList.add('active');
                // Scroll brochure to top when opened
                modalEl.scrollTop = 0;
            }
        }, 1350);
    };

    window.onSandRoseBoxClosed = function () {
        if (modalEl) {
            modalEl.classList.remove('active');
        }
        if (fogEl) {
            fogEl.classList.remove('active');
        }
        if (hintPill) {
            hintPill.classList.remove('hidden');
        }
        audioEngine.playClose();
    };

    function requestClose() {
        if (window.sandroseCloseVault) {
            window.sandroseCloseVault();
        } else {
            window.onSandRoseBoxClosed();
        }
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', requestClose);
    }
    if (bottomResealBtn) {
        bottomResealBtn.addEventListener('click', requestClose);
    }

    // Close when clicking outside the brochure sheet
    if (modalEl) {
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) {
                requestClose();
            }
        });
    }

    // Header Open Brochure button
    if (openBrochureNavBtn) {
        openBrochureNavBtn.addEventListener('click', () => {
            if (window.sandroseOpenVault) {
                window.sandroseOpenVault();
            } else {
                window.onSandRoseBoxOpened();
            }
        });
    }

    // Prompt pill click opens the box
    if (hintPill) {
        hintPill.addEventListener('click', () => {
            if (window.sandroseOpenVault) {
                window.sandroseOpenVault();
            }
        });
    }

    // Escape key closes/reseals
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalEl && modalEl.classList.contains('active')) {
            requestClose();
        }
    });
}

/* ==========================================================================
   3. DOWNLOAD SINGLE PAGE BROCHURE VIA CANVAS
   ========================================================================== */
function initBrochureDownload() {
    const downloadBtn = document.getElementById('download-brochure-btn');
    if (!downloadBtn) return;

    downloadBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1100;
        canvas.height = 700;
        const ctx = canvas.getContext('2d');

        // Dark Luxury Rosewood folio background
        const grad = ctx.createLinearGradient(0, 0, 1100, 700);
        grad.addColorStop(0, '#1c0c0a');
        grad.addColorStop(0.5, '#0e0706');
        grad.addColorStop(1, '#24100e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1100, 700);

        // Gold Foil Border
        ctx.strokeStyle = '#e5b869';
        ctx.lineWidth = 4;
        ctx.strokeRect(30, 30, 1040, 640);

        ctx.strokeStyle = 'rgba(229, 184, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(42, 42, 1016, 616);

        // Title
        ctx.fillStyle = '#e5b869';
        ctx.font = 'bold 44px "Playfair Display", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('SandRose', 550, 110);

        ctx.fillStyle = 'rgba(255, 235, 195, 0.85)';
        ctx.font = '14px "Plus Jakarta Sans", sans-serif';
        ctx.letterSpacing = '3px';
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
        ctx.fillText('  Hypnotic crimson veins, heirloom density, and resonant acoustic acoustics with mirror luster.', 80, 380);

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
        link.download = 'SandRose_Single_Page_Brochure.png';
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
   4. SOUND TOGGLE
   ========================================================================== */
function initSoundToggle() {
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (!soundBtn) return;

    soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            soundBtn.innerHTML = `<i data-lucide="volume-2"></i><span>Sound: ON</span>`;
            soundBtn.classList.remove('muted');
            audioEngine.init();
            audioEngine.playChord([523.25, 659.25], 'sine', 0.4, 0.05);
        } else {
            soundBtn.innerHTML = `<i data-lucide="volume-x"></i><span>Sound: OFF</span>`;
            soundBtn.classList.add('muted');
        }
        if (window.lucide) window.lucide.createIcons();
    });
}

/* ==========================================================================
   5. NOTIFY FORM
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

            localStorage.setItem('sandrose_subscriber', email);
            input.value = '';

            if (feedback) {
                feedback.textContent = "✦ You have reserved VIP Priority Access for Batch 001. A confidential invite will be sent to your inbox.";
                feedback.classList.add('show');
            }

            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 70,
                    spread: 80,
                    origin: { y: 0.8 },
                    colors: ['#e6b85c', '#d6a354', '#8a2323']
                });
            }
        });
    }
}

/* ==========================================================================
   6. CUSTOM CURSOR
   ========================================================================== */
function initCustomCursor() {
    const cursorDot = document.querySelector('.custom-cursor-dot');
    const cursorRing = document.querySelector('.custom-cursor-ring');

    if (!cursorDot || !cursorRing) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    });

    function renderRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
        requestAnimationFrame(renderRing);
    }
    renderRing();

    const hoverables = document.querySelectorAll('button, a, input, .clickable');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-hover'));
    });
}
