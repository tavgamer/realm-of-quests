// Realm of Quests - Music Manager
// Generates ambient background music using Web Audio API — no audio files needed!
//
// HOW IT WORKS:
// Each biome has a "drone" (sustained chord) + a looping melody.
// Drone: multiple oscillators held on continuously at low volume.
// Melody: a look-ahead scheduler plays one note at a time from a pattern array.
//   0 in the pattern = rest (silence). The scheduler runs every 120ms and queues
//   notes slightly ahead of playback — this is the standard Web Audio timing trick
//   to prevent gaps without blocking the main thread.
//
// Calling play('area2') fades out the current track and fades in the new one.

const BIOME_TRACKS = {
    area1: {   // Greenwood Village — bright, adventurous
        drone: [65.41, 98.00],                           // C2, G2 (open fifth)
        melody: [523.25, 587.33, 659.25, 0, 523.25, 659.25, 783.99, 659.25,
                 523.25, 440.00, 523.25, 0, 659.25, 783.99, 659.25, 523.25],
        tempo: 128, wave: 'triangle', vol: 0.12
    },
    area2: {   // Underwater City — flowing, mysterious
        drone: [55.00, 82.41],                           // A1, E2
        melody: [440.00, 0, 493.88, 440.00, 392.00, 0, 349.23, 392.00,
                 440.00, 0, 523.25, 0, 440.00, 392.00, 349.23, 0],
        tempo: 72, wave: 'sine', vol: 0.11
    },
    area3: {   // Murkveil Swamp — dark, eerie
        drone: [73.42, 87.31],                           // D2, F2 (minor third)
        melody: [293.66, 0, 311.13, 293.66, 261.63, 0, 233.08, 0,
                 246.94, 293.66, 0, 261.63, 233.08, 0, 246.94, 0],
        tempo: 62, wave: 'sawtooth', vol: 0.08
    },
    area4: {   // Sunscorch Desert — exotic, Phrygian
        drone: [82.41, 87.31, 123.47],                  // E2, F2, B2
        melody: [329.63, 349.23, 0, 329.63, 293.66, 0, 261.63, 0,
                 293.66, 329.63, 369.99, 329.63, 293.66, 0, 261.63, 329.63],
        tempo: 88, wave: 'triangle', vol: 0.10
    },
    area5: {   // Emberpeak Volcano — intense, driving
        drone: [55.00, 65.41, 98.00],                   // A1, C2, G2 (Am chord)
        melody: [440.00, 493.88, 415.30, 0, 440.00, 369.99, 392.00, 0,
                 440.00, 493.88, 523.25, 493.88, 440.00, 0, 369.99, 0],
        tempo: 152, wave: 'sawtooth', vol: 0.09
    },
    area6: {   // Frosthollow Tundra — cold, sparse
        drone: [61.74, 92.50],                           // B1, F#2
        melody: [493.88, 0, 0, 440.00, 0, 369.99, 0, 0,
                 493.88, 0, 415.30, 0, 440.00, 0, 0, 0],
        tempo: 48, wave: 'sine', vol: 0.11
    },
    area7: {   // Dreadmoor Castle — gothic, tense
        drone: [32.70, 65.41, 87.31],                   // C1, C2, F2
        melody: [261.63, 277.18, 233.08, 0, 246.94, 261.63, 0, 220.00,
                 233.08, 0, 261.63, 277.18, 261.63, 0, 233.08, 0],
        tempo: 68, wave: 'square', vol: 0.06
    },
    area8: {   // Crystalvein Caverns — sparkling, underground
        drone: [98.00, 146.83, 196.00],                 // G2, D3, G3
        melody: [392.00, 440.00, 493.88, 0, 523.25, 493.88, 0, 440.00,
                 392.00, 0, 440.00, 493.88, 440.00, 0, 392.00, 349.23],
        tempo: 96, wave: 'triangle', vol: 0.11
    },
    area9: {   // Skyreach Temple — ethereal, celestial
        drone: [174.61, 261.63, 349.23],                // F3, C4, F4
        melody: [698.46, 783.99, 659.25, 0, 698.46, 0, 783.99, 659.25,
                 698.46, 0, 523.25, 587.33, 659.25, 0, 698.46, 0],
        tempo: 60, wave: 'sine', vol: 0.12
    },
    area10: {  // The Shadow Realm — ominous, final
        drone: [32.70, 46.25],                           // C1, Bb1 (tritone)
        melody: [130.81, 0, 138.59, 0, 123.47, 0, 116.54, 0,
                 123.47, 130.81, 0, 138.59, 0, 123.47, 0, 0],
        tempo: 44, wave: 'sawtooth', vol: 0.09
    },
    elder_house: {  // Elder's Home — warm, cozy
        drone: [130.81, 196.00, 261.63],                // C3, G3, C4
        melody: [523.25, 587.33, 659.25, 0, 659.25, 587.33, 523.25, 0,
                 493.88, 523.25, 0, 587.33, 523.25, 0, 493.88, 523.25],
        tempo: 80, wave: 'triangle', vol: 0.11
    }
};

class MusicManager {
    constructor() {
        this._ctx = null;
        this._masterGain = null;
        this._droneNodes = [];
        this._melodyNodes = [];
        this._loopTimer = null;
        this._nextNoteTime = 0;
        this._melodyIdx = 0;
        this._currentAreaId = null;
        this._currentTrack = null;
        this._running = false;
    }

    _getCtx() {
        if (!this._ctx) {
            this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this._ctx.state === 'suspended') this._ctx.resume();
        return this._ctx;
    }

    // Switch to a new biome track — fades out old track first
    play(areaId) {
        if (this._currentAreaId === areaId) return;
        this._fadeOut(() => this._startTrack(areaId));
    }

    stop() {
        this._fadeOut(() => {});
        this._currentAreaId = null;
    }

    // ── INTERNALS ──────────────────────────────────────────────────

    _fadeOut(callback) {
        if (!this._masterGain) { this._stopAll(); callback(); return; }
        const ctx = this._ctx;
        const gain = this._masterGain;
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
        setTimeout(() => { this._stopAll(); callback(); }, 1600);
    }

    _stopAll() {
        this._running = false;
        if (this._loopTimer) { clearTimeout(this._loopTimer); this._loopTimer = null; }
        [...this._droneNodes, ...this._melodyNodes].forEach(n => {
            try { n.disconnect(); if (n.stop) n.stop(0); } catch (e) {}
        });
        this._droneNodes = [];
        this._melodyNodes = [];
        if (this._masterGain) {
            try { this._masterGain.disconnect(); } catch (e) {}
            this._masterGain = null;
        }
    }

    _startTrack(areaId) {
        const track = BIOME_TRACKS[areaId];
        if (!track) return;
        this._currentAreaId = areaId;
        this._currentTrack = track;

        const ctx = this._getCtx();

        // Master gain — fades in over 2.5 seconds
        this._masterGain = ctx.createGain();
        this._masterGain.gain.setValueAtTime(0, ctx.currentTime);
        this._masterGain.gain.linearRampToValueAtTime(track.vol, ctx.currentTime + 2.5);
        this._masterGain.connect(ctx.destination);

        // Drone: one oscillator per chord note, slightly detuned for warmth
        track.drone.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = track.wave;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.detune.setValueAtTime(i * 3, ctx.currentTime); // subtle chorus
            gain.gain.setValueAtTime(0.55 / track.drone.length, ctx.currentTime);
            osc.connect(gain); gain.connect(this._masterGain);
            osc.start();
            this._droneNodes.push(osc, gain);
        });

        // Melody — starts after drone fades in
        this._melodyIdx = 0;
        this._nextNoteTime = ctx.currentTime + 2.6;
        this._running = true;
        this._scheduleMelody();
    }

    // Look-ahead scheduler: queues notes slightly ahead of playback time.
    // This runs every 120ms and fills the next 400ms of notes.
    _scheduleMelody() {
        if (!this._running || !this._currentTrack) return;
        const ctx = this._ctx;
        const track = this._currentTrack;
        const beatDur = 60 / track.tempo;

        while (this._nextNoteTime < ctx.currentTime + 0.4) {
            const freq = track.melody[this._melodyIdx % track.melody.length];
            if (freq > 0) {
                this._playMelodyNote(freq, this._nextNoteTime, beatDur * 0.75);
            }
            this._nextNoteTime += beatDur;
            this._melodyIdx++;
        }

        this._loopTimer = setTimeout(() => this._scheduleMelody(), 120);
    }

    _playMelodyNote(freq, startTime, duration) {
        const ctx = this._ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine'; // melody always uses sine — softer than the drone
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.55, startTime + 0.02);
        gain.gain.setValueAtTime(0.55, startTime + duration * 0.65);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);
        osc.connect(gain); gain.connect(this._masterGain);
        osc.start(startTime); osc.stop(startTime + duration + 0.05);
        this._melodyNodes.push(osc, gain);
        // Prune old nodes so we don't leak memory
        if (this._melodyNodes.length > 100) this._melodyNodes.splice(0, 50);
    }
}
