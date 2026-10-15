/**
 * SandRose - Simple Coming Soon Landing Page Engine
 * Features:
 * - 1-Week (7-Day) Live Countdown Timer
 * - Clean Email Notification Form
 */

document.addEventListener('DOMContentLoaded', () => {
    initTimer();
    initNotify();
});

function initTimer() {
    const STORAGE_KEY = 'sandrose_countdown_target';
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

    function update() {
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

    update();
    setInterval(update, 1000);
}

function initNotify() {
    const form = document.getElementById('notify-form');
    const input = document.getElementById('notify-email');
    const msg = document.getElementById('notify-msg');

    if (form && input) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = input.value.trim();
            if (!email) return;

            localStorage.setItem('sandrose_subscriber_email', email);
            input.value = '';

            if (msg) {
                msg.textContent = '✦ Thank you. We will notify you when we launch.';
                msg.classList.add('show');
            }
        });
    }
}
