// Realm of Quests - Sound Manager
// Uses the browser's built-in Web Audio API — no library or audio files needed!
//
// HOW IT WORKS:
// An Oscillator generates a continuous tone at a frequency (like a tuning fork).
// A GainNode controls volume — you can ramp it from 0→loud→0 to shape the sound.
// They connect like a signal chain: Oscillator → GainNode → Speakers.
// For noise (hit/walk sounds), we fill a buffer with random numbers — that's what
// noise IS at the signal level: random vibration.
//
// Each sound method designs its own chain and auto-cleans up when done.

class SoundManager {
    constructor() {
        this._ctx = null;
        this._lastFootstep = 0;
    }

    _getCtx() {
        if (!this._ctx) {
            this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Browsers suspend audio until a user gesture — resume if needed
        if (this._ctx.state === 'suspended') this._ctx.resume();
        return this._ctx;
    }

    play(name) {
        try {
            const ctx = this._getCtx();
            switch (name) {
                case 'slash':         this._playSlash(ctx);        break;
                case 'slashWood':     this._playSlashWood(ctx);    break;
                case 'slashMagic':    this._playSlashMagic(ctx);   break;
                case 'slashFire':     this._playSlashFire(ctx);    break;
                case 'slashDagger':   this._playSlashDagger(ctx);  break;
                case 'slashHeavy':    this._playSlashHeavy(ctx);   break;
                case 'hit':           this._playHit(ctx);          break;
                case 'enemyDie':      this._playEnemyDie(ctx);     break;
                case 'playerHit':     this._playPlayerHit(ctx);    break;
                case 'questComplete': this._playQuestComplete(ctx); break;
                case 'levelUp':       this._playLevelUp(ctx);      break;
                case 'potionUse':     this._playPotionUse(ctx);    break;
                case 'goldPickup':    this._playGoldPickup(ctx);   break;
            }
        } catch (e) { /* audio blocked or unsupported */ }
    }

    // Footstep — throttled to once per 350ms so it sounds natural
    playWalk() {
        const now = Date.now();
        if (now - this._lastFootstep < 350) return;
        this._lastFootstep = now;
        try { this._playWalk(this._getCtx()); } catch (e) {}
    }

    // ── SOUND DEFINITIONS ──────────────────────────────────────────

    _playSlash(ctx) {
        // Sawtooth sweep: sharp attack, quick pitch drop (sword swing)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(700, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.09);
        gain.gain.setValueAtTime(0.28, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.12);
    }

    _playHit(ctx) {
        // Bandpass-filtered noise burst (punchy impact)
        const bufLen = Math.ceil(ctx.sampleRate * 0.08);
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource(); src.buffer = buf;
        const filt = ctx.createBiquadFilter();
        filt.type = 'bandpass'; filt.frequency.setValueAtTime(350, ctx.currentTime);
        filt.Q.setValueAtTime(1.5, ctx.currentTime);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.45, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
        src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
        src.start(); src.stop(ctx.currentTime + 0.09);
    }

    _playEnemyDie(ctx) {
        // Triangle sweep from 430 Hz down to 75 Hz (descending death tone)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(430, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(75, ctx.currentTime + 0.38);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.42);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.45);
    }

    _playPlayerHit(ctx) {
        // Low-pass noise thud + descending tone (heavy body blow)
        const bufLen = Math.ceil(ctx.sampleRate * 0.12);
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
        }
        const src = ctx.createBufferSource(); src.buffer = buf;
        const filt = ctx.createBiquadFilter();
        filt.type = 'lowpass'; filt.frequency.setValueAtTime(220, ctx.currentTime);
        const g1 = ctx.createGain(); g1.gain.setValueAtTime(0.5, ctx.currentTime);
        src.connect(filt); filt.connect(g1); g1.connect(ctx.destination);
        src.start(); src.stop(ctx.currentTime + 0.14);

        const osc = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc.frequency.setValueAtTime(130, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.13);
        g2.gain.setValueAtTime(0.25, ctx.currentTime);
        g2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.14);
        osc.connect(g2); g2.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
    }

    _playWalk(ctx) {
        // Very short decaying noise click (soft footstep)
        const bufLen = Math.ceil(ctx.sampleRate * 0.03);
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
        }
        const src = ctx.createBufferSource(); src.buffer = buf;
        const gain = ctx.createGain(); gain.gain.setValueAtTime(0.12, ctx.currentTime);
        src.connect(gain); gain.connect(ctx.destination);
        src.start();
    }

    _playQuestComplete(ctx) {
        // Ascending 4-note fanfare: C5 → E5 → G5 → C6
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            const t = ctx.currentTime + i * 0.11;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.28, t + 0.03);
            gain.gain.setValueAtTime(0.28, t + 0.09);
            gain.gain.linearRampToValueAtTime(0, t + 0.28);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(t); osc.stop(t + 0.32);
        });
    }

    _playLevelUp(ctx) {
        // Wide ascending sweep (satisfying power-up)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1040, ctx.currentTime + 0.55);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.45);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.65);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.7);
    }

    _playPotionUse(ctx) {
        // Sine oscillator with fast LFO modulation = bubbly glug
        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, ctx.currentTime);
        lfo.frequency.setValueAtTime(18, ctx.currentTime);
        lfoGain.gain.setValueAtTime(90, ctx.currentTime);
        lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
        gain.gain.setValueAtTime(0.22, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.35);
        lfo.start(); lfo.stop(ctx.currentTime + 0.35);
    }

    _playGoldPickup(ctx) {
        // Bright ascending ping (coin ding)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1650, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.28, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.14);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.16);
    }

    _playSlashWood(ctx) {
        // Dull wooden thwack — triangle with low freq, thick noise layer
        const osc = ctx.createOscillator();
        const g1 = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(210, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.12);
        g1.gain.setValueAtTime(0.22, ctx.currentTime);
        g1.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.14);
        osc.connect(g1); g1.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.16);

        // Woody thud noise
        const bufLen = Math.ceil(ctx.sampleRate * 0.1);
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025));
        const src = ctx.createBufferSource(); src.buffer = buf;
        const filt = ctx.createBiquadFilter();
        filt.type = 'lowpass'; filt.frequency.setValueAtTime(300, ctx.currentTime);
        const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.3, ctx.currentTime);
        src.connect(filt); filt.connect(g2); g2.connect(ctx.destination);
        src.start(); src.stop(ctx.currentTime + 0.12);
    }

    _playSlashMagic(ctx) {
        // Magical swoosh — sine sweeps up then fades with sparkle overtone
        const osc = ctx.createOscillator();
        const g1 = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.3);
        g1.gain.setValueAtTime(0, ctx.currentTime);
        g1.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.04);
        g1.gain.setValueAtTime(0.22, ctx.currentTime + 0.18);
        g1.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35);
        osc.connect(g1); g1.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.38);

        // High sparkle overtone
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2200, ctx.currentTime + 0.08);
        osc2.frequency.exponentialRampToValueAtTime(3400, ctx.currentTime + 0.2);
        g2.gain.setValueAtTime(0, ctx.currentTime + 0.08);
        g2.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.12);
        g2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.32);
        osc2.connect(g2); g2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.08); osc2.stop(ctx.currentTime + 0.35);
    }

    _playSlashFire(ctx) {
        // Fire crackle — sawtooth bite + warm noise burst (fire catching)
        const osc = ctx.createOscillator();
        const g1 = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08);
        g1.gain.setValueAtTime(0.26, ctx.currentTime);
        g1.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        osc.connect(g1); g1.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.12);

        // Fire crackle noise — bandpass centred high
        const bufLen = Math.ceil(ctx.sampleRate * 0.18);
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.06));
        const src = ctx.createBufferSource(); src.buffer = buf;
        const filt = ctx.createBiquadFilter();
        filt.type = 'bandpass'; filt.frequency.setValueAtTime(2800, ctx.currentTime);
        filt.Q.setValueAtTime(0.8, ctx.currentTime);
        const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.18, ctx.currentTime);
        src.connect(filt); filt.connect(g2); g2.connect(ctx.destination);
        src.start(); src.stop(ctx.currentTime + 0.2);
    }

    _playSlashDagger(ctx) {
        // Quick sharp stab — very short high-pitched hiss (fast weapon)
        const osc = ctx.createOscillator();
        const g1 = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.055);
        g1.gain.setValueAtTime(0.2, ctx.currentTime);
        g1.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.06);
        osc.connect(g1); g1.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.07);

        // Brief hiss
        const bufLen = Math.ceil(ctx.sampleRate * 0.05);
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource(); src.buffer = buf;
        const filt = ctx.createBiquadFilter();
        filt.type = 'highpass'; filt.frequency.setValueAtTime(3500, ctx.currentTime);
        const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.15, ctx.currentTime);
        g2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
        src.connect(filt); filt.connect(g2); g2.connect(ctx.destination);
        src.start(); src.stop(ctx.currentTime + 0.06);
    }

    _playSlashHeavy(ctx) {
        // Deep powerful swing — low sawtooth with long decay (heavy weapon)
        const osc = ctx.createOscillator();
        const g1 = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(380, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(65, ctx.currentTime + 0.22);
        g1.gain.setValueAtTime(0, ctx.currentTime);
        g1.gain.linearRampToValueAtTime(0.32, ctx.currentTime + 0.015);
        g1.gain.setValueAtTime(0.32, ctx.currentTime + 0.05);
        g1.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.28);
        osc.connect(g1); g1.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.3);

        // Sub-bass rumble for weight
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(90, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.2);
        g2.gain.setValueAtTime(0.2, ctx.currentTime);
        g2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.22);
        osc2.connect(g2); g2.connect(ctx.destination);
        osc2.start(); osc2.stop(ctx.currentTime + 0.25);
    }
}
