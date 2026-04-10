// Realm of Quests - Map Renderer
// Draws the world for each area. Called from GameScene.create().
// Each area has its own render function for ground, paths, water, decorations, and buildings.

class MapRenderer {
    constructor(scene, tileSize) {
        this.scene = scene;
        this.ts = tileSize;
    }

    // Main entry point — call with area ID
    render(areaId, worldW, worldH, buildingBodies) {
        this.worldW = worldW;
        this.worldH = worldH;
        this.bodies = buildingBodies;
        this.waterZones = [];
        this.portalZone = null;  // Only this zone teleports back

        switch (areaId) {
            case 'area3': return this.renderSwamp();
            case 'area4': return this.renderDesert();
            case 'area5': return this.renderVolcano();
            case 'area6': return this.renderTundra();
            case 'area7': return this.renderCastle();
            case 'area8': return this.renderCrystalCaves();
            case 'area9': return this.renderSkyTemple();
            case 'area10': return this.renderShadowRealm();
            default: return { waterZones: [], portalZone: null };
        }
    }

    // Helper: add a collision body
    addBody(x, y, w, h) {
        const b = this.bodies.create(x + w/2, y + h/2, null);
        b.setVisible(false); b.body.setSize(w, h); b.setOrigin(0.5); b.refreshBody();
    }

    // Helper: draw water zone
    drawWater(waterGfx, tx, ty, tw, th) {
        const x = tx * this.ts, y = ty * this.ts;
        const w = tw * this.ts, h = th * this.ts;
        waterGfx.fillStyle(0x0d47a1, 0.8);
        waterGfx.fillRoundedRect(x - 3, y - 3, w + 6, h + 6, 6);
        waterGfx.fillStyle(0x1976d2, 0.9);
        waterGfx.fillRoundedRect(x, y, w, h, 4);
        waterGfx.fillStyle(0x42a5f5, 0.4);
        waterGfx.fillRoundedRect(x + 4, y + 4, w * 0.6, h * 0.3, 3);
        this.waterZones.push({ x, y, w, h });
    }

    // Helper: draw a portal with glow
    drawPortal(x, y, w, h, color, label) {
        const gfx = this.scene.add.graphics().setDepth(3);
        gfx.lineStyle(3, color, 0.6);
        gfx.strokeRoundedRect(x - 4, y - 4, w + 8, h + 8, 8);
        gfx.fillStyle(color, 0.15);
        gfx.fillRoundedRect(x, y, w, h, 4);
        this.scene.tweens.add({
            targets: gfx, alpha: { from: 1, to: 0.3 },
            duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        if (label) {
            const txt = this.scene.add.text(x + w/2, y - 8, label, {
                fontSize: '8px', fontFamily: 'Nunito', fontStyle: 'bold',
                color: '#' + color.toString(16).padStart(6, '0'),
                stroke: '#000000', strokeThickness: 2, resolution: 2
            }).setOrigin(0.5).setDepth(7);
            this.scene.tweens.add({
                targets: txt, y: txt.y - 4,
                duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
        }
    }

    // Helper: scatter static decorations on a shared graphics
    scatterDeco(gfx, items, drawFn) {
        items.forEach(item => drawFn(gfx, item));
    }

    // =============================================
    // AREA 3: Murkveil Swamp
    // =============================================
    renderSwamp() {
        const s = this.scene, ts = this.ts, W = this.worldW, H = this.worldH;
        // Ground — dark murky green
        const gfx = s.add.graphics().setDepth(0);
        gfx.fillStyle(0x2d4a1e, 1); gfx.fillRect(0, 0, W, H);
        for (let i = 0; i < 200; i++) {
            gfx.fillStyle(0x1a3012, Phaser.Math.FloatBetween(0.3, 0.6));
            gfx.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(10, 40));
        }
        // Fog patches
        for (let i = 0; i < 30; i++) {
            gfx.fillStyle(0x88aa88, Phaser.Math.FloatBetween(0.05, 0.12));
            gfx.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(30, 80));
        }

        // Paths — muddy brown
        const pathGfx = s.add.graphics().setDepth(1);
        pathGfx.fillStyle(0x5c4033, 0.7);
        pathGfx.fillRect(ts, 30 * ts, W - ts * 2, ts * 2);
        pathGfx.fillRect(40 * ts, ts * 3, ts * 2, H - ts * 6);

        // Swamp water pools
        const waterGfx = s.add.graphics().setDepth(2);
        this.drawWater(waterGfx, 10, 15, 8, 6);
        this.drawWater(waterGfx, 55, 40, 6, 5);
        this.drawWater(waterGfx, 25, 48, 5, 4);

        // Return portal (swamp)
        const portalPool = this.waterZones[0];
        this.drawPortal(portalPool.x, portalPool.y, portalPool.w, portalPool.h, 0x00ff88, 'Portal to Surface');
        this.portalZone = portalPool;

        // Trees — swamp willows (droopy)
        const treeGfx = s.add.graphics().setDepth(4);
        const treeSpots = [];
        for (let i = 0; i < 60; i++) {
            treeSpots.push([Phaser.Math.Between(2, 78), Phaser.Math.Between(2, 58)]);
        }
        treeSpots.forEach(([tx, ty]) => {
            const x = tx * ts + 8, y = ty * ts + 8;
            treeGfx.fillStyle(0x3d2b1f, 1); treeGfx.fillRect(x - 2, y - 2, 4, 12);
            treeGfx.fillStyle(0x4a6b2f, 0.9); treeGfx.fillCircle(x, y - 6, Phaser.Math.Between(8, 13));
            treeGfx.fillStyle(0x5a7b3f, 0.5); treeGfx.fillCircle(x - 3, y - 8, Phaser.Math.Between(5, 8));
            // Hanging vines
            treeGfx.lineStyle(1, 0x3a5f20, 0.5);
            treeGfx.beginPath(); treeGfx.moveTo(x - 3, y); treeGfx.lineTo(x - 5, y + 10); treeGfx.strokePath();
            treeGfx.beginPath(); treeGfx.moveTo(x + 3, y); treeGfx.lineTo(x + 5, y + 8); treeGfx.strokePath();
        });

        // Buildings — witch hut, hermit shack
        const buildGfx = s.add.graphics().setDepth(5);
        // Witch hut
        buildGfx.fillStyle(0x4a3728, 1); buildGfx.fillRect(38 * ts, 28 * ts, 4 * ts, 3 * ts);
        buildGfx.fillStyle(0x2d1f14, 1); buildGfx.fillRect(37 * ts, 27 * ts, 6 * ts, ts);
        this.addBody(38 * ts, 28 * ts, 4 * ts, 3 * ts);
        // Hermit shack
        buildGfx.fillStyle(0x5c4033, 1); buildGfx.fillRect(13 * ts, 38 * ts, 3 * ts, 2 * ts);
        buildGfx.fillStyle(0x3d2b1f, 1); buildGfx.fillRect(12 * ts, 37 * ts, 5 * ts, ts);
        this.addBody(13 * ts, 38 * ts, 3 * ts, 2 * ts);

        // Mushrooms, lily pads (static deco)
        const decoGfx = s.add.graphics().setDepth(2);
        for (let i = 0; i < 40; i++) {
            const fx = Phaser.Math.Between(ts * 2, W - ts * 2);
            const fy = Phaser.Math.Between(ts * 2, H - ts * 2);
            decoGfx.fillStyle(0x8fbc8f, 0.7); decoGfx.fillCircle(fx, fy, 3);
            decoGfx.fillStyle(0x6b8e23, 0.5); decoGfx.fillCircle(fx, fy, 2);
        }

        // Bubbles in swamp water
        for (let i = 0; i < 8; i++) {
            const bubble = s.add.circle(
                Phaser.Math.Between(10 * ts, 18 * ts), Phaser.Math.Between(15 * ts, 21 * ts),
                2, 0x88aa88, 0.5
            ).setDepth(3);
            s.tweens.add({
                targets: bubble, y: bubble.y - 20, alpha: 0,
                duration: Phaser.Math.Between(2000, 4000), repeat: -1,
                delay: Phaser.Math.Between(0, 3000),
                onRepeat: () => { bubble.y = Phaser.Math.Between(15 * ts, 21 * ts); bubble.x = Phaser.Math.Between(10 * ts, 18 * ts); }
            });
        }

        return { waterZones: this.waterZones, portalZone: this.portalZone };
    }

    // =============================================
    // AREA 4: Sunscorch Desert
    // =============================================
    renderDesert() {
        const s = this.scene, ts = this.ts, W = this.worldW, H = this.worldH;
        const gfx = s.add.graphics().setDepth(0);
        gfx.fillStyle(0xd4a757, 1); gfx.fillRect(0, 0, W, H);
        for (let i = 0; i < 200; i++) {
            gfx.fillStyle(0xc4973f, Phaser.Math.FloatBetween(0.2, 0.5));
            gfx.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(10, 40));
        }
        // Sand dunes (lighter patches)
        for (let i = 0; i < 30; i++) {
            gfx.fillStyle(0xe8c872, Phaser.Math.FloatBetween(0.3, 0.5));
            gfx.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(20, 60));
        }

        // Paths
        const pathGfx = s.add.graphics().setDepth(1);
        pathGfx.fillStyle(0xb8860b, 0.6);
        pathGfx.fillRect(ts, 30 * ts, W - ts * 2, ts * 2);
        pathGfx.fillRect(45 * ts, ts * 3, ts * 2, H - ts * 6);

        // Oasis (water)
        const waterGfx = s.add.graphics().setDepth(2);
        this.drawWater(waterGfx, 20, 25, 5, 4);

        // Portal (desert)
        const portal = this.waterZones[0];
        this.drawPortal(portal.x, portal.y, portal.w, portal.h, 0x00ff88, 'Portal to Surface');
        this.portalZone = portal;

        // Cacti
        const decoGfx = s.add.graphics().setDepth(4);
        for (let i = 0; i < 35; i++) {
            const cx = Phaser.Math.Between(3, 87) * ts;
            const cy = Phaser.Math.Between(3, 57) * ts;
            decoGfx.fillStyle(0x2d6b2d, 0.9);
            decoGfx.fillRect(cx, cy, 3, 14);
            decoGfx.fillRect(cx - 4, cy + 3, 3, 7);
            decoGfx.fillRect(cx + 4, cy + 5, 3, 5);
        }

        // Desert buildings — tents
        const buildGfx = s.add.graphics().setDepth(5);
        // Chief tent
        buildGfx.fillStyle(0x8b6914, 0.9);
        buildGfx.fillTriangle(43 * ts, 28 * ts, 47 * ts, 28 * ts, 45 * ts, 26 * ts);
        buildGfx.fillStyle(0x6b4f10, 0.9);
        buildGfx.fillRect(43 * ts, 28 * ts, 4 * ts, 2 * ts);
        this.addBody(43 * ts, 28 * ts, 4 * ts, 2 * ts);
        // Trader tent
        buildGfx.fillStyle(0xa0522d, 0.9);
        buildGfx.fillTriangle(48 * ts, 33 * ts, 52 * ts, 33 * ts, 50 * ts, 31 * ts);
        buildGfx.fillRect(48 * ts, 33 * ts, 4 * ts, 2 * ts);
        this.addBody(48 * ts, 33 * ts, 4 * ts, 2 * ts);

        // Rocks
        for (let i = 0; i < 20; i++) {
            const rx = Phaser.Math.Between(3, 87) * ts;
            const ry = Phaser.Math.Between(3, 57) * ts;
            const sz = Phaser.Math.Between(4, 8);
            decoGfx.fillStyle(0x8b7355, 0.8); decoGfx.fillCircle(rx, ry, sz);
            decoGfx.fillStyle(0xa08060, 0.4); decoGfx.fillCircle(rx - 1, ry - 1, sz - 2);
        }

        // Heat shimmer particles
        for (let i = 0; i < 6; i++) {
            const shimmer = s.add.rectangle(
                Phaser.Math.Between(0, W), Phaser.Math.Between(H * 0.3, H * 0.7),
                Phaser.Math.Between(20, 50), 1, 0xffffff, 0.1
            ).setDepth(6);
            s.tweens.add({
                targets: shimmer, alpha: { from: 0, to: 0.15 }, y: shimmer.y - 30,
                duration: Phaser.Math.Between(3000, 6000), yoyo: true, repeat: -1,
                delay: Phaser.Math.Between(0, 3000)
            });
        }

        return { waterZones: this.waterZones, portalZone: this.portalZone };
    }

    // =============================================
    // AREA 5: Emberpeak Volcano
    // =============================================
    renderVolcano() {
        const s = this.scene, ts = this.ts, W = this.worldW, H = this.worldH;
        const gfx = s.add.graphics().setDepth(0);
        // Dark volcanic rock
        gfx.fillStyle(0x2a1a0a, 1); gfx.fillRect(0, 0, W, H);
        for (let i = 0; i < 150; i++) {
            gfx.fillStyle(0x3d2010, Phaser.Math.FloatBetween(0.3, 0.6));
            gfx.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(8, 35));
        }
        // Lava glow patches
        for (let i = 0; i < 20; i++) {
            gfx.fillStyle(0xff4500, Phaser.Math.FloatBetween(0.05, 0.12));
            gfx.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(20, 50));
        }

        // Lava rivers (using water drawing but orange)
        const lavaGfx = s.add.graphics().setDepth(2);
        lavaGfx.fillStyle(0x8b0000, 0.8); lavaGfx.fillRoundedRect(20 * ts - 3, 20 * ts - 3, 10 * ts + 6, 4 * ts + 6, 6);
        lavaGfx.fillStyle(0xff4500, 0.9); lavaGfx.fillRoundedRect(20 * ts, 20 * ts, 10 * ts, 4 * ts, 4);
        lavaGfx.fillStyle(0xff6347, 0.4); lavaGfx.fillRoundedRect(20 * ts + 4, 20 * ts + 4, 6 * ts, ts, 3);
        this.waterZones.push({ x: 20 * ts, y: 20 * ts, w: 10 * ts, h: 4 * ts });

        lavaGfx.fillStyle(0x8b0000, 0.8); lavaGfx.fillRoundedRect(50 * ts - 3, 50 * ts - 3, 8 * ts + 6, 5 * ts + 6, 6);
        lavaGfx.fillStyle(0xff4500, 0.9); lavaGfx.fillRoundedRect(50 * ts, 50 * ts, 8 * ts, 5 * ts, 4);
        this.waterZones.push({ x: 50 * ts, y: 50 * ts, w: 8 * ts, h: 5 * ts });

        // Return portal (safe zone near spawn)
        const portalX = 65 * ts, portalY = 60 * ts, portalW = 5 * ts, portalH = 3 * ts;
        lavaGfx.fillStyle(0x0d47a1, 0.8); lavaGfx.fillRoundedRect(portalX - 3, portalY - 3, portalW + 6, portalH + 6, 6);
        lavaGfx.fillStyle(0x1976d2, 0.9); lavaGfx.fillRoundedRect(portalX, portalY, portalW, portalH, 4);
        this.waterZones.push({ x: portalX, y: portalY, w: portalW, h: portalH });
        this.drawPortal(portalX, portalY, portalW, portalH, 0x00ff88, 'Portal to Surface');
        this.portalZone = this.waterZones[this.waterZones.length - 1];

        // Paths
        const pathGfx = s.add.graphics().setDepth(1);
        pathGfx.fillStyle(0x4a3020, 0.7);
        pathGfx.fillRect(ts, 35 * ts, W - ts * 2, ts * 2);
        pathGfx.fillRect(40 * ts, ts * 3, ts * 2, H - ts * 6);

        // Volcanic rocks/boulders
        const decoGfx = s.add.graphics().setDepth(4);
        for (let i = 0; i < 30; i++) {
            const rx = Phaser.Math.Between(3, 77) * ts;
            const ry = Phaser.Math.Between(3, 67) * ts;
            const sz = Phaser.Math.Between(5, 10);
            decoGfx.fillStyle(0x1a0a00, 0.9); decoGfx.fillCircle(rx, ry, sz);
            decoGfx.fillStyle(0x3d2010, 0.5); decoGfx.fillCircle(rx - 1, ry - 1, sz - 2);
        }

        // Buildings
        const buildGfx = s.add.graphics().setDepth(5);
        buildGfx.fillStyle(0x4a3020, 1); buildGfx.fillRect(38 * ts, 33 * ts, 4 * ts, 3 * ts);
        buildGfx.fillStyle(0x8b0000, 0.8); buildGfx.fillRect(37 * ts, 32 * ts, 6 * ts, ts);
        this.addBody(38 * ts, 33 * ts, 4 * ts, 3 * ts);
        buildGfx.fillStyle(0x4a3020, 1); buildGfx.fillRect(18 * ts, 43 * ts, 3 * ts, 2 * ts);
        this.addBody(18 * ts, 43 * ts, 3 * ts, 2 * ts);

        // Ember particles
        for (let i = 0; i < 10; i++) {
            const ember = s.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), 1, 0xff4500, 0.7).setDepth(6);
            s.tweens.add({
                targets: ember, y: ember.y - Phaser.Math.Between(40, 100), alpha: 0,
                duration: Phaser.Math.Between(2000, 5000), repeat: -1,
                delay: Phaser.Math.Between(0, 3000),
                onRepeat: () => { ember.x = Phaser.Math.Between(0, W); ember.y = Phaser.Math.Between(H * 0.3, H); }
            });
        }

        return { waterZones: this.waterZones, portalZone: this.portalZone };
    }

    // =============================================
    // AREA 6: Frosthollow Tundra
    // =============================================
    renderTundra() {
        const s = this.scene, ts = this.ts, W = this.worldW, H = this.worldH;
        const gfx = s.add.graphics().setDepth(0);
        gfx.fillStyle(0xdce8f0, 1); gfx.fillRect(0, 0, W, H);
        for (let i = 0; i < 200; i++) {
            gfx.fillStyle(0xc8dce8, Phaser.Math.FloatBetween(0.3, 0.6));
            gfx.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(10, 40));
        }
        // Snow drifts
        for (let i = 0; i < 25; i++) {
            gfx.fillStyle(0xf0f8ff, Phaser.Math.FloatBetween(0.3, 0.6));
            gfx.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(20, 50));
        }

        // Icy paths
        const pathGfx = s.add.graphics().setDepth(1);
        pathGfx.fillStyle(0xa0b8c8, 0.7);
        pathGfx.fillRect(ts, 30 * ts, W - ts * 2, ts * 2);
        pathGfx.fillRect(45 * ts, ts * 3, ts * 2, H - ts * 6);

        // Frozen lake
        const waterGfx = s.add.graphics().setDepth(2);
        waterGfx.fillStyle(0x4682b4, 0.6); waterGfx.fillRoundedRect(30 * ts, 20 * ts, 12 * ts, 8 * ts, 6);
        waterGfx.fillStyle(0x87ceeb, 0.4); waterGfx.fillRoundedRect(32 * ts, 22 * ts, 8 * ts, 4 * ts, 4);
        this.waterZones.push({ x: 30 * ts, y: 20 * ts, w: 12 * ts, h: 8 * ts });

        // Portal
        this.drawWater(waterGfx, 75, 50, 5, 3);
        const p = this.waterZones[1];
        this.drawPortal(p.x, p.y, p.w, p.h, 0x00ff88, 'Portal to Surface');
        this.portalZone = p;

        // Pine trees (triangular)
        const treeGfx = s.add.graphics().setDepth(4);
        for (let i = 0; i < 50; i++) {
            const tx = Phaser.Math.Between(2, 88) * ts;
            const ty = Phaser.Math.Between(2, 58) * ts;
            treeGfx.fillStyle(0x5d4037, 1); treeGfx.fillRect(tx, ty + 5, 3, 8);
            treeGfx.fillStyle(0x1b5e20, 0.9);
            treeGfx.fillTriangle(tx + 1, ty - 8, tx - 6, ty + 5, tx + 8, ty + 5);
            treeGfx.fillStyle(0x2e7d32, 0.7);
            treeGfx.fillTriangle(tx + 1, ty - 4, tx - 4, ty + 3, tx + 6, ty + 3);
            // Snow on top
            treeGfx.fillStyle(0xf0f8ff, 0.8);
            treeGfx.fillTriangle(tx + 1, ty - 8, tx - 3, ty - 3, tx + 5, ty - 3);
        }

        // Buildings — ice lodge
        const buildGfx = s.add.graphics().setDepth(5);
        buildGfx.fillStyle(0x87ceeb, 0.8); buildGfx.fillRect(43 * ts, 28 * ts, 4 * ts, 3 * ts);
        buildGfx.fillStyle(0x4682b4, 0.8); buildGfx.fillRect(42 * ts, 27 * ts, 6 * ts, ts);
        this.addBody(43 * ts, 28 * ts, 4 * ts, 3 * ts);
        buildGfx.fillStyle(0x708090, 0.8); buildGfx.fillRect(13 * ts, 38 * ts, 3 * ts, 2 * ts);
        this.addBody(13 * ts, 38 * ts, 3 * ts, 2 * ts);

        // Snowfall particles
        for (let i = 0; i < 12; i++) {
            const snow = s.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(-20, 0), 1.5, 0xffffff, 0.7).setDepth(8);
            s.tweens.add({
                targets: snow,
                y: H + 20, x: snow.x + Phaser.Math.Between(-50, 50),
                duration: Phaser.Math.Between(5000, 10000), repeat: -1,
                delay: Phaser.Math.Between(0, 5000),
                onRepeat: () => { snow.x = Phaser.Math.Between(0, W); snow.y = -20; }
            });
        }

        return { waterZones: this.waterZones, portalZone: this.portalZone };
    }

    // =============================================
    // AREA 7: Dreadmoor Castle
    // =============================================
    renderCastle() {
        const s = this.scene, ts = this.ts, W = this.worldW, H = this.worldH;
        const gfx = s.add.graphics().setDepth(0);
        gfx.fillStyle(0x1a1a2e, 1); gfx.fillRect(0, 0, W, H);
        for (let i = 0; i < 150; i++) {
            gfx.fillStyle(0x252540, Phaser.Math.FloatBetween(0.3, 0.5));
            gfx.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(10, 35));
        }
        // Stone floor in castle area
        gfx.fillStyle(0x37374f, 0.5);
        gfx.fillRect(15 * ts, 15 * ts, 40 * ts, 40 * ts);
        for (let sx = 15 * ts; sx < 55 * ts; sx += 8) {
            for (let sy = 15 * ts; sy < 55 * ts; sy += 8) {
                gfx.fillStyle(0x454560, Phaser.Math.FloatBetween(0.2, 0.4));
                gfx.fillRect(sx, sy, 7, 7);
            }
        }

        // Paths
        const pathGfx = s.add.graphics().setDepth(1);
        pathGfx.fillStyle(0x3d3d5c, 0.7);
        pathGfx.fillRect(ts, 35 * ts, W - ts * 2, ts * 2);
        pathGfx.fillRect(35 * ts, ts * 3, ts * 2, H - ts * 6);

        // Castle walls
        const wallGfx = s.add.graphics().setDepth(3);
        wallGfx.fillStyle(0x37474f, 1);
        wallGfx.fillRect(15 * ts, 15 * ts, 40 * ts, 6); // top
        wallGfx.fillRect(15 * ts, 15 * ts, 6, 40 * ts); // left
        wallGfx.fillRect(55 * ts - 6, 15 * ts, 6, 40 * ts); // right
        wallGfx.fillRect(15 * ts, 55 * ts - 6, 18 * ts, 6); // bottom-left
        wallGfx.fillRect(37 * ts, 55 * ts - 6, 18 * ts, 6); // bottom-right
        // Battlements
        for (let bx = 15 * ts; bx < 55 * ts; bx += 10) {
            wallGfx.fillStyle(0x455a64, 1); wallGfx.fillRect(bx, 15 * ts - 4, 6, 5);
        }
        this.addBody(15 * ts, 15 * ts, 40 * ts, 6);
        this.addBody(15 * ts, 15 * ts, 6, 40 * ts);
        this.addBody(55 * ts - 6, 15 * ts, 6, 40 * ts);
        this.addBody(15 * ts, 55 * ts - 6, 18 * ts, 6);
        this.addBody(37 * ts, 55 * ts - 6, 18 * ts, 6);

        // Portal
        const waterGfx = s.add.graphics().setDepth(2);
        this.drawWater(waterGfx, 55, 60, 5, 3);
        const p = this.waterZones[0];
        this.drawPortal(p.x, p.y, p.w, p.h, 0x00ff88, 'Portal to Surface');
        this.portalZone = p;

        // Spooky fog
        for (let i = 0; i < 8; i++) {
            const fog = s.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(30, 60), 0x8888bb, 0.06).setDepth(6);
            s.tweens.add({
                targets: fog, x: fog.x + Phaser.Math.Between(-40, 40), alpha: { from: 0.03, to: 0.08 },
                duration: Phaser.Math.Between(4000, 8000), yoyo: true, repeat: -1
            });
        }

        // Torch lights inside castle
        [[20, 20], [50, 20], [20, 50], [50, 50], [35, 35]].forEach(([tx, ty]) => {
            const flame = s.add.circle(tx * ts, ty * ts, 3, 0xff9800, 0.7).setDepth(7);
            s.tweens.add({
                targets: flame, scaleX: { from: 0.8, to: 1.3 }, alpha: { from: 0.5, to: 0.9 },
                duration: 400, yoyo: true, repeat: -1
            });
            const glow = s.add.circle(tx * ts, ty * ts, 15, 0xff9800, 0.08).setDepth(6);
            s.tweens.add({ targets: glow, alpha: { from: 0.05, to: 0.12 }, duration: 600, yoyo: true, repeat: -1 });
        });

        return { waterZones: this.waterZones, portalZone: this.portalZone };
    }

    // =============================================
    // AREA 8: Crystalvein Caverns
    // =============================================
    renderCrystalCaves() {
        const s = this.scene, ts = this.ts, W = this.worldW, H = this.worldH;
        const gfx = s.add.graphics().setDepth(0);
        gfx.fillStyle(0x1a1030, 1); gfx.fillRect(0, 0, W, H);
        for (let i = 0; i < 150; i++) {
            gfx.fillStyle(0x251845, Phaser.Math.FloatBetween(0.3, 0.5));
            gfx.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(8, 30));
        }

        // Paths
        const pathGfx = s.add.graphics().setDepth(1);
        pathGfx.fillStyle(0x2a1a40, 0.7);
        pathGfx.fillRect(ts, 35 * ts, W - ts * 2, ts * 2);
        pathGfx.fillRect(40 * ts, ts * 3, ts * 2, H - ts * 6);

        // Crystal formations (glowing)
        const crystalGfx = s.add.graphics().setDepth(4);
        const crystalColors = [0x7b68ee, 0xda70d6, 0x00ced1, 0x9370db, 0xff69b4];
        for (let i = 0; i < 50; i++) {
            const cx = Phaser.Math.Between(3, 77) * ts;
            const cy = Phaser.Math.Between(3, 67) * ts;
            const col = crystalColors[Phaser.Math.Between(0, 4)];
            crystalGfx.fillStyle(col, 0.8);
            crystalGfx.fillTriangle(cx, cy - 12, cx - 4, cy + 2, cx + 4, cy + 2);
            crystalGfx.fillStyle(col, 0.4);
            crystalGfx.fillTriangle(cx + 3, cy - 8, cx, cy + 2, cx + 6, cy + 2);
        }

        // Crystal glow ambient
        for (let i = 0; i < 10; i++) {
            const glow = s.add.circle(
                Phaser.Math.Between(5 * ts, W - 5 * ts), Phaser.Math.Between(5 * ts, H - 5 * ts),
                Phaser.Math.Between(15, 30), crystalColors[Phaser.Math.Between(0, 4)], 0.06
            ).setDepth(1);
            s.tweens.add({
                targets: glow, alpha: { from: 0.03, to: 0.1 },
                duration: Phaser.Math.Between(2000, 4000), yoyo: true, repeat: -1
            });
        }

        // Portal
        const waterGfx = s.add.graphics().setDepth(2);
        this.drawWater(waterGfx, 65, 60, 5, 3);
        const p = this.waterZones[0];
        this.drawPortal(p.x, p.y, p.w, p.h, 0x00ff88, 'Portal to Surface');
        this.portalZone = p;

        // Buildings — crystal structures
        const buildGfx = s.add.graphics().setDepth(5);
        buildGfx.fillStyle(0x483d8b, 0.8); buildGfx.fillRect(38 * ts, 33 * ts, 4 * ts, 3 * ts);
        buildGfx.fillStyle(0x7b68ee, 0.6); buildGfx.fillRect(37 * ts, 32 * ts, 6 * ts, ts);
        this.addBody(38 * ts, 33 * ts, 4 * ts, 3 * ts);
        buildGfx.fillStyle(0x483d8b, 0.7); buildGfx.fillRect(13 * ts, 48 * ts, 3 * ts, 2 * ts);
        this.addBody(13 * ts, 48 * ts, 3 * ts, 2 * ts);

        return { waterZones: this.waterZones, portalZone: this.portalZone };
    }

    // =============================================
    // AREA 9: Skyreach Temple
    // =============================================
    renderSkyTemple() {
        const s = this.scene, ts = this.ts, W = this.worldW, H = this.worldH;
        const gfx = s.add.graphics().setDepth(0);
        // Sky blue with clouds
        gfx.fillStyle(0x87ceeb, 1); gfx.fillRect(0, 0, W, H);
        // Cloud floor
        for (let i = 0; i < 100; i++) {
            gfx.fillStyle(0xf0f8ff, Phaser.Math.FloatBetween(0.5, 0.9));
            gfx.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(15, 50));
        }
        // Golden temple floor in center
        gfx.fillStyle(0xdaa520, 0.3);
        gfx.fillRect(20 * ts, 15 * ts, 40 * ts, 30 * ts);
        for (let sx = 20 * ts; sx < 60 * ts; sx += 8) {
            for (let sy = 15 * ts; sy < 45 * ts; sy += 8) {
                gfx.fillStyle(0xffd700, Phaser.Math.FloatBetween(0.1, 0.3));
                gfx.fillRect(sx, sy, 7, 7);
            }
        }

        // Paths (golden)
        const pathGfx = s.add.graphics().setDepth(1);
        pathGfx.fillStyle(0xdaa520, 0.6);
        pathGfx.fillRect(ts, 30 * ts, W - ts * 2, ts * 2);
        pathGfx.fillRect(40 * ts, ts * 3, ts * 2, H - ts * 6);

        // Portal
        const waterGfx = s.add.graphics().setDepth(2);
        this.drawWater(waterGfx, 65, 50, 5, 3);
        const p = this.waterZones[0];
        this.drawPortal(p.x, p.y, p.w, p.h, 0x00ff88, 'Portal to Surface');
        this.portalZone = p;

        // Temple pillars
        const buildGfx = s.add.graphics().setDepth(5);
        [[22, 17], [22, 42], [58, 17], [58, 42], [40, 17], [40, 42]].forEach(([px, py]) => {
            buildGfx.fillStyle(0xdaa520, 1);
            buildGfx.fillRect(px * ts - 3, py * ts, 6, 4 * ts);
            buildGfx.fillStyle(0xffd700, 0.8);
            buildGfx.fillRect(px * ts - 5, py * ts - 3, 10, 5);
            buildGfx.fillRect(px * ts - 5, py * ts + 4 * ts - 2, 10, 5);
            this.addBody(px * ts - 3, py * ts, 6, 4 * ts);
        });

        // NPC buildings
        buildGfx.fillStyle(0xdaa520, 0.8); buildGfx.fillRect(38 * ts, 28 * ts, 4 * ts, 3 * ts);
        buildGfx.fillStyle(0xffd700, 0.6); buildGfx.fillRect(37 * ts, 27 * ts, 6 * ts, ts);
        this.addBody(38 * ts, 28 * ts, 4 * ts, 3 * ts);

        // Floating cloud particles
        for (let i = 0; i < 6; i++) {
            const cloud = s.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H),
                Phaser.Math.Between(8, 20), 0xffffff, 0.3).setDepth(6);
            s.tweens.add({
                targets: cloud, x: cloud.x + Phaser.Math.Between(-60, 60),
                alpha: { from: 0.15, to: 0.4 },
                duration: Phaser.Math.Between(5000, 10000), yoyo: true, repeat: -1
            });
        }

        return { waterZones: this.waterZones, portalZone: this.portalZone };
    }

    // =============================================
    // AREA 10: The Shadow Realm (FINAL)
    // =============================================
    renderShadowRealm() {
        const s = this.scene, ts = this.ts, W = this.worldW, H = this.worldH;
        const gfx = s.add.graphics().setDepth(0);
        gfx.fillStyle(0x0a0015, 1); gfx.fillRect(0, 0, W, H);
        for (let i = 0; i < 200; i++) {
            gfx.fillStyle(0x150025, Phaser.Math.FloatBetween(0.3, 0.6));
            gfx.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(10, 40));
        }
        // Dark purple rifts
        for (let i = 0; i < 15; i++) {
            gfx.fillStyle(0x4a0080, Phaser.Math.FloatBetween(0.05, 0.15));
            gfx.fillCircle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(20, 60));
        }

        // Paths — dark purple
        const pathGfx = s.add.graphics().setDepth(1);
        pathGfx.fillStyle(0x2d0050, 0.6);
        pathGfx.fillRect(ts, 35 * ts, W - ts * 2, ts * 2);
        pathGfx.fillRect(45 * ts, ts * 3, ts * 2, H - ts * 6);

        // Void pools
        const waterGfx = s.add.graphics().setDepth(2);
        waterGfx.fillStyle(0x1a0033, 0.8); waterGfx.fillRoundedRect(25 * ts, 25 * ts, 8 * ts, 6 * ts, 6);
        waterGfx.fillStyle(0x4a0080, 0.6); waterGfx.fillRoundedRect(26 * ts, 26 * ts, 6 * ts, 4 * ts, 4);
        this.waterZones.push({ x: 25 * ts, y: 25 * ts, w: 8 * ts, h: 6 * ts });

        // Portal
        this.drawWater(waterGfx, 75, 60, 5, 3);
        const p = this.waterZones[1];
        this.drawPortal(p.x, p.y, p.w, p.h, 0x00ff88, 'Portal to Surface');
        this.portalZone = p;

        // Shadow pillars (broken)
        const buildGfx = s.add.graphics().setDepth(5);
        for (let i = 0; i < 12; i++) {
            const px = Phaser.Math.Between(5, 85) * ts;
            const py = Phaser.Math.Between(10, 65) * ts;
            const h = Phaser.Math.Between(15, 30);
            buildGfx.fillStyle(0x1a0030, 0.9); buildGfx.fillRect(px, py, 5, h);
            buildGfx.fillStyle(0x2d0050, 0.6); buildGfx.fillRect(px - 2, py, 9, 3);
        }

        // NPC structures
        buildGfx.fillStyle(0x2d0050, 0.8); buildGfx.fillRect(43 * ts, 33 * ts, 4 * ts, 3 * ts);
        this.addBody(43 * ts, 33 * ts, 4 * ts, 3 * ts);
        buildGfx.fillStyle(0x1a0033, 0.8); buildGfx.fillRect(18 * ts, 43 * ts, 3 * ts, 2 * ts);
        this.addBody(18 * ts, 43 * ts, 3 * ts, 2 * ts);

        // Shadow wisps (animated)
        for (let i = 0; i < 10; i++) {
            const wisp = s.add.circle(
                Phaser.Math.Between(0, W), Phaser.Math.Between(0, H),
                Phaser.Math.Between(2, 4), 0x9932cc, 0.4
            ).setDepth(6);
            s.tweens.add({
                targets: wisp,
                x: wisp.x + Phaser.Math.Between(-80, 80),
                y: wisp.y + Phaser.Math.Between(-80, 80),
                alpha: { from: 0.2, to: 0.6 },
                duration: Phaser.Math.Between(3000, 7000),
                yoyo: true, repeat: -1,
                delay: Phaser.Math.Between(0, 3000)
            });
        }

        // Dark Lord's throne (center-back area)
        buildGfx.fillStyle(0x1a0033, 1); buildGfx.fillRect(42 * ts, 55 * ts, 6 * ts, 4 * ts);
        buildGfx.fillStyle(0x4a0080, 0.8); buildGfx.fillRect(43 * ts, 54 * ts, 4 * ts, 2 * ts);
        buildGfx.fillStyle(0x9932cc, 0.5); buildGfx.fillRect(44 * ts, 55 * ts + 4, 2 * ts, ts);
        this.addBody(42 * ts, 55 * ts, 6 * ts, 4 * ts);

        return { waterZones: this.waterZones, portalZone: this.portalZone };
    }
}
