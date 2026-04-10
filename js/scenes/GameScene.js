// Realm of Quests - Game Scene
// This is the MAIN scene where the actual gameplay happens!
// It creates the map, spawns the player, and handles collisions.
//
// NEW CONCEPTS:
// - Tilemap: The game world is built from a grid of small tiles (16x16 pixels).
//   Think of it like placing LEGO blocks on a grid to build a world.
// - Layers: Tilemaps have layers (ground layer, wall layer, decoration layer).
//   This lets us put grass underneath a wall tile.
// - Collision: We tell Phaser "these tiles are solid" so the player can't walk through them.

class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    init(data) {
        this.currentAreaId = data.areaId || 'area1';
        this.currentArea = AREAS[this.currentAreaId];
        this.savedPlayerStats = data.playerStats || null;
        this.savedQuestStates = data.questStates || null;
        this.overrideSpawn = data.overrideSpawn || null;
        this._teleporting = false;
    }

    create() {
        const mapWidth = this.currentArea.width;
        const mapHeight = this.currentArea.height;
        const tileSize = 16;
        const isUnderwater = (this.currentAreaId === 'area2');
        const isElderHouse = (this.currentAreaId === 'elder_house');
        const isNewArea = /^area([3-9]|10)$/.test(this.currentAreaId);
        const worldW = mapWidth * tileSize;
        const worldH = mapHeight * tileSize;

        // ============================================================
        // DYNAMIC MAP — no tiles, everything drawn with Graphics
        // ============================================================
        const gfx = this.add.graphics().setDepth(0);

        // --- GROUND ---
        if (isNewArea) {
            // Handled by MapRenderer below
        } else if (isElderHouse) {
            // Wooden floor interior
            gfx.fillStyle(0x6d4c2e, 1); gfx.fillRect(0, 0, worldW, worldH);
            // Wood plank lines
            for (let y = 0; y < worldH; y += 16) {
                gfx.fillStyle(0x5a3d22, 0.4);
                gfx.fillRect(0, y, worldW, 1);
            }
            for (let x = 0; x < worldW; x += 24) {
                gfx.fillStyle(0x5a3d22, 0.3);
                gfx.fillRect(x, 0, 1, worldH);
            }
            // Warm lighting patches
            for (let i = 0; i < 15; i++) {
                const px = Phaser.Math.Between(20, worldW - 20);
                const py = Phaser.Math.Between(20, worldH - 20);
                gfx.fillStyle(0x8b6914, Phaser.Math.FloatBetween(0.1, 0.25));
                gfx.fillCircle(px, py, Phaser.Math.Between(10, 30));
            }
        } else if (isUnderwater) {
            // Deep ocean floor gradient
            gfx.fillStyle(0x0d2137, 1); gfx.fillRect(0, 0, worldW, worldH);
            for (let i = 0; i < 80; i++) {
                const px = Phaser.Math.Between(0, worldW);
                const py = Phaser.Math.Between(0, worldH);
                gfx.fillStyle(0x122a42, Phaser.Math.FloatBetween(0.3, 0.6));
                gfx.fillCircle(px, py, Phaser.Math.Between(15, 50));
            }
        } else {
            // Rich green grass base
            gfx.fillStyle(0x3d8b37, 1); gfx.fillRect(0, 0, worldW, worldH);
            // Grass color variation
            for (let i = 0; i < 300; i++) {
                const px = Phaser.Math.Between(0, worldW);
                const py = Phaser.Math.Between(0, worldH);
                const colors = [0x4a9e44, 0x358030, 0x2d7028, 0x50a84a, 0x3d8b37];
                gfx.fillStyle(colors[Phaser.Math.Between(0, 4)], Phaser.Math.FloatBetween(0.3, 0.7));
                gfx.fillCircle(px, py, Phaser.Math.Between(8, 30));
            }
            // Darker jungle ground in the southeast (where the hidden pond is)
            for (let i = 0; i < 120; i++) {
                const px = Phaser.Math.Between(55 * tileSize, 95 * tileSize);
                const py = Phaser.Math.Between(35 * tileSize, 75 * tileSize);
                gfx.fillStyle(0x1b5e20, Phaser.Math.FloatBetween(0.3, 0.6));
                gfx.fillCircle(px, py, Phaser.Math.Between(10, 40));
            }
        }

        // --- PATHS (tan/sandy roads) ---
        const pathGfx = this.add.graphics().setDepth(1);

        if (isNewArea) {
            // Handled by MapRenderer
        } else if (isElderHouse) {
            // Interior rug
            const rugX = 4 * tileSize, rugY = 3 * tileSize;
            const rugW = 6 * tileSize, rugH = 5 * tileSize;
            pathGfx.fillStyle(0x8b1a1a, 0.7);
            pathGfx.fillRoundedRect(rugX, rugY, rugW, rugH, 4);
            pathGfx.fillStyle(0xc4a265, 0.5);
            pathGfx.fillRoundedRect(rugX + 6, rugY + 6, rugW - 12, rugH - 12, 3);
            pathGfx.fillStyle(0x8b1a1a, 0.6);
            pathGfx.fillRoundedRect(rugX + 14, rugY + 14, rugW - 28, rugH - 28, 2);
        } else if (!isUnderwater) {
            const pathColor = 0xc4a265;
            const pathEdge = 0xb08a4a;
            const pw = tileSize * 2;

            // Main horizontal road (runs across the map at y=40)
            const mainRoadY = 40 * tileSize;
            pathGfx.fillStyle(pathEdge, 1);
            pathGfx.fillRect(tileSize, mainRoadY - 2, worldW - tileSize * 2, pw + 4);
            pathGfx.fillStyle(pathColor, 1);
            pathGfx.fillRect(tileSize, mainRoadY, worldW - tileSize * 2, pw);
            for (let x = tileSize; x < worldW - tileSize; x += 12) {
                pathGfx.fillStyle(pathEdge, 0.3);
                pathGfx.fillCircle(x + Phaser.Math.Between(0, 8), mainRoadY + Phaser.Math.Between(2, pw - 2), Phaser.Math.Between(1, 3));
            }

            // Vertical path (center of map)
            const midX = 50 * tileSize;
            pathGfx.fillStyle(pathEdge, 1);
            pathGfx.fillRect(midX - 2, tileSize * 3, pw + 4, worldH - tileSize * 6);
            pathGfx.fillStyle(pathColor, 1);
            pathGfx.fillRect(midX, tileSize * 3, pw, worldH - tileSize * 6);

            // City path — from city gate (y=22) down to main road (y=40)
            const cityPathX = 14 * tileSize;
            pathGfx.fillStyle(pathEdge, 1);
            pathGfx.fillRect(cityPathX - 2, 22 * tileSize, pw + 4, 18 * tileSize + 4);
            pathGfx.fillStyle(pathColor, 1);
            pathGfx.fillRect(cityPathX, 22 * tileSize, pw, 18 * tileSize);

            // Path from city gate to the right, connecting to main road
            pathGfx.fillStyle(pathEdge, 1);
            pathGfx.fillRect(cityPathX, mainRoadY - 2, (midX - cityPathX) + pw, pw + 4);
            pathGfx.fillStyle(pathColor, 1);
            pathGfx.fillRect(cityPathX, mainRoadY, (midX - cityPathX) + pw, pw);
        } else {
            const pathColor = 0x1a3a50;
            const pathEdge = 0x152e40;
            const midY = Math.floor(mapHeight / 2) * tileSize;
            const midX = Math.floor(mapWidth / 2) * tileSize;
            const pw = tileSize * 2;
            pathGfx.fillStyle(pathEdge, 1);
            pathGfx.fillRect(tileSize, midY - 2, worldW - tileSize * 2, pw + 4);
            pathGfx.fillStyle(pathColor, 1);
            pathGfx.fillRect(tileSize, midY, worldW - tileSize * 2, pw);
            pathGfx.fillStyle(pathEdge, 1);
            pathGfx.fillRect(midX - 2, tileSize * 3, pw + 4, worldH - tileSize * 6);
            pathGfx.fillStyle(pathColor, 1);
            pathGfx.fillRect(midX, tileSize * 3, pw, worldH - tileSize * 6);
        }

        // --- WATER AREAS (animated below) ---
        this.waterZones = [];
        const waterGfx = this.add.graphics().setDepth(2);
        const drawWater = (tx, ty, tw, th) => {
            const x = tx * tileSize, y = ty * tileSize;
            const w = tw * tileSize, h = th * tileSize;
            waterGfx.fillStyle(0x0d47a1, 0.8);
            waterGfx.fillRoundedRect(x - 3, y - 3, w + 6, h + 6, 6);
            waterGfx.fillStyle(0x1976d2, 0.9);
            waterGfx.fillRoundedRect(x, y, w, h, 4);
            waterGfx.fillStyle(0x42a5f5, 0.4);
            waterGfx.fillRoundedRect(x + 4, y + 4, w * 0.6, h * 0.3, 3);
            this.waterZones.push({ x, y, w, h });
        };

        if (isNewArea) {
            // Water handled by MapRenderer
        } else if (isElderHouse) {
            // No water in the elder's house
        } else if (!isUnderwater) {
            drawWater(68, 52, 8, 7);  // Hidden pond (deep in jungle, harder to find)
            drawWater(18, 28, 3, 2);  // Village pond (outside city, near path)
            drawWater(38, 12, 4, 3);  // Small lake up north
        } else {
            drawWater(12, 10, 6, 4);  // Deep pool 1 (portal)
            drawWater(52, 35, 4, 3);  // Deep pool 2
        }

        // Area1 hidden pond — very subtle mysterious glow (hard to notice)
        if (!isUnderwater && !isElderHouse && !isNewArea && this.waterZones.length > 0) {
            const hiddenPond = this.waterZones[0];
            const mystGfx = this.add.graphics().setDepth(3);
            mystGfx.fillStyle(0x00bfa5, 0.08);
            mystGfx.fillRoundedRect(hiddenPond.x - 2, hiddenPond.y - 2, hiddenPond.w + 4, hiddenPond.h + 4, 6);
            this.tweens.add({
                targets: mystGfx, alpha: { from: 0.3, to: 0.8 },
                duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
        }

        // Area2 portal glow on the top-left pool
        if (isUnderwater && this.waterZones.length > 0) {
            const portal = this.waterZones[0]; // First pool = the portal
            // Green glow ring to signal "this is special"
            const portalGfx = this.add.graphics().setDepth(3);
            portalGfx.lineStyle(3, 0x00ff88, 0.6);
            portalGfx.strokeRoundedRect(portal.x - 4, portal.y - 4, portal.w + 8, portal.h + 8, 8);
            // Inner glow
            portalGfx.fillStyle(0x00ff88, 0.15);
            portalGfx.fillRoundedRect(portal.x, portal.y, portal.w, portal.h, 4);
            // Pulsing animation
            this.tweens.add({
                targets: portalGfx,
                alpha: { from: 1, to: 0.3 },
                duration: 1200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            // "Portal" label
            const portalLabel = this.add.text(
                portal.x + portal.w / 2, portal.y - 8,
                'Portal to Surface', {
                    fontSize: '8px', fontFamily: 'Nunito', fontStyle: 'bold',
                    color: '#00ff88', stroke: '#000000', strokeThickness: 2
                }
            ).setOrigin(0.5).setDepth(7);
            this.tweens.add({
                targets: portalLabel,
                y: portalLabel.y - 4,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            // Sparkle particles around portal
            for (let i = 0; i < 8; i++) {
                const sparkle = this.add.circle(
                    portal.x + Phaser.Math.Between(5, portal.w - 5),
                    portal.y + Phaser.Math.Between(5, portal.h - 5),
                    2, 0x00ff88, 0.8
                ).setDepth(3);
                this.tweens.add({
                    targets: sparkle,
                    y: sparkle.y - Phaser.Math.Between(15, 30),
                    alpha: 0,
                    duration: Phaser.Math.Between(1500, 3000),
                    repeat: -1,
                    delay: Phaser.Math.Between(0, 2000),
                    onRepeat: () => {
                        sparkle.x = portal.x + Phaser.Math.Between(5, portal.w - 5);
                        sparkle.y = portal.y + Phaser.Math.Between(5, portal.h - 5);
                    }
                });
            }
        }

        // Animated water ripples
        this.waterRipples = [];
        this.waterZones.forEach(zone => {
            for (let i = 0; i < 4; i++) {
                const ripple = this.add.circle(
                    zone.x + Phaser.Math.Between(10, zone.w - 10),
                    zone.y + Phaser.Math.Between(10, zone.h - 10),
                    Phaser.Math.Between(3, 8), 0x64b5f6, 0.3
                ).setDepth(3);
                this.tweens.add({
                    targets: ripple,
                    scaleX: 2, scaleY: 2, alpha: 0,
                    duration: Phaser.Math.Between(2000, 4000),
                    repeat: -1,
                    delay: Phaser.Math.Between(0, 2000),
                    onRepeat: () => {
                        ripple.x = zone.x + Phaser.Math.Between(10, zone.w - 10);
                        ripple.y = zone.y + Phaser.Math.Between(10, zone.h - 10);
                        ripple.setScale(1);
                    }
                });
                this.waterRipples.push(ripple);
            }
        });

        // --- TREES (drawn as actual tree shapes) ---
        const treePositions = (isUnderwater || isElderHouse || isNewArea) ? [] : [
            // Northern forest (scattered clusters)
            [3,2],[4,2],[5,2],[6,2],[3,3],[4,3],[5,3],
            [28,2],[29,2],[30,2],[31,2],[28,3],[29,3],[30,3],
            [45,3],[46,3],[47,3],[45,4],[46,4],
            [55,2],[56,2],[57,2],[58,2],[55,3],[56,3],
            [85,2],[86,2],[87,2],[85,3],[86,3],[88,4],[89,4],
            // Trees around the village pond
            [17,26],[17,27],[21,27],[22,27],[22,28],
            // West forest
            [2,30],[3,30],[2,31],[3,31],[4,32],[2,36],[3,36],[4,36],[2,37],[3,37],
            [2,45],[3,45],[4,45],[5,45],[2,46],[3,46],
            [2,55],[3,55],[4,55],[2,56],[3,56],[5,58],[6,58],
            [2,65],[3,65],[4,65],[2,66],[3,66],[5,68],[6,68],
            // Central scattered trees
            [32,18],[33,18],[34,18],[38,20],[39,20],
            [30,30],[31,30],[35,32],[36,32],
            [42,25],[43,25],[44,25],[42,26],[43,26],
            [48,15],[49,15],[48,16],[49,16],
            // South meadow trees
            [8,60],[9,60],[10,60],[8,61],[9,61],
            [20,62],[21,62],[22,62],[20,63],[21,63],
            [35,65],[36,65],[37,65],[35,66],[36,66],
            [15,72],[16,72],[17,72],[15,73],[16,73],
            [42,70],[43,70],[44,70],[42,71],[43,71],
            // East side trees
            [90,15],[91,15],[92,15],[90,16],[91,16],
            [85,25],[86,25],[87,25],[85,26],[86,26],
            [92,35],[93,35],[94,35],[92,36],[93,36],
            [88,60],[89,60],[90,60],[88,61],[89,61],
            [95,70],[96,70],[97,70],[95,71],[96,71],
            // ===== DENSE JUNGLE (southeast — hides the teleport pond) =====
            // Jungle border (north edge ~y35)
            [55,34],[56,34],[57,34],[58,34],[59,34],[60,34],[62,34],[63,34],[65,34],
            [67,34],[68,34],[70,34],[72,34],[74,34],[76,34],[78,34],[80,34],
            [82,34],[84,34],[86,34],[88,34],[90,34],[92,34],
            [55,35],[56,35],[58,35],[60,35],[62,35],[64,35],[66,35],[68,35],
            [70,35],[72,35],[74,35],[76,35],[78,35],[80,35],[82,35],[84,35],
            // Jungle border (west edge ~x55)
            [54,36],[54,38],[54,40],[54,42],[54,44],[54,46],[54,48],
            [54,50],[54,52],[54,54],[54,56],[54,58],[54,60],[54,62],
            [55,37],[55,39],[55,41],[55,43],[55,45],[55,47],[55,49],
            [55,51],[55,53],[55,55],[55,57],[55,59],[55,61],
            // Dense interior jungle (around the pond at 68,52)
            [57,37],[58,37],[59,38],[60,38],[61,39],[62,39],[63,38],[64,37],
            [57,40],[58,41],[59,42],[60,40],[61,41],[62,42],[63,41],[64,40],
            [57,44],[58,44],[59,45],[60,45],[61,44],[62,44],[63,45],[64,45],
            [57,47],[58,48],[59,48],[60,47],[61,48],[62,48],[63,47],[64,48],
            // Pond surround — EXTREMELY thick (the hidden pond is at 68,52 size 8x7)
            // Triple-layered wall of trees around the pond
            [63,48],[64,48],[65,48],[66,48],[67,48],[76,48],[77,48],[78,48],[79,48],[80,48],
            [63,49],[64,49],[65,49],[66,49],[67,49],[76,49],[77,49],[78,49],[79,49],[80,49],
            [63,50],[64,50],[65,50],[66,50],[67,50],[76,50],[77,50],[78,50],[79,50],[80,50],
            [63,51],[64,51],[65,51],[66,51],[67,51],[77,51],[78,51],[79,51],[80,51],
            [63,52],[64,52],[65,52],[66,52],[77,52],[78,52],[79,52],[80,52],
            [63,53],[64,53],[65,53],[66,53],[77,53],[78,53],[79,53],[80,53],
            [63,54],[64,54],[65,54],[66,54],[77,54],[78,54],[79,54],[80,54],
            [63,55],[64,55],[65,55],[66,55],[77,55],[78,55],[79,55],[80,55],
            [63,56],[64,56],[65,56],[66,56],[67,56],[77,56],[78,56],[79,56],[80,56],
            [63,57],[64,57],[65,57],[66,57],[67,57],[76,57],[77,57],[78,57],[79,57],[80,57],
            [63,58],[64,58],[65,58],[66,58],[67,58],[76,58],[77,58],[78,58],[79,58],[80,58],
            [63,59],[64,59],[65,59],[66,59],[67,59],[68,59],[69,59],[70,59],[71,59],
            [72,59],[73,59],[74,59],[75,59],[76,59],[77,59],[78,59],[79,59],[80,59],
            [63,60],[64,60],[65,60],[66,60],[67,60],[68,60],[69,60],[70,60],[71,60],
            [72,60],[73,60],[74,60],[75,60],[76,60],[77,60],[78,60],[79,60],[80,60],
            // More jungle fill
            [57,50],[58,50],[59,51],[60,52],[61,51],[62,50],[63,51],
            [57,54],[58,55],[59,54],[60,55],[61,56],[62,55],[63,54],
            [57,58],[58,58],[59,59],[60,58],[61,59],[62,58],[63,59],
            [80,37],[81,37],[82,38],[83,38],[84,37],[85,38],[86,37],
            [80,40],[81,41],[82,40],[83,41],[84,42],[85,41],[86,40],
            [80,44],[81,44],[82,45],[83,45],[84,44],[85,45],[86,44],
            [80,48],[81,48],[82,49],[83,48],[84,49],[85,48],[86,49],
            [80,52],[81,52],[82,53],[83,52],[84,53],[85,52],[86,53],
            [80,56],[81,56],[82,57],[83,56],[84,57],[85,56],[86,57],
            [80,60],[81,60],[82,60],[83,61],[84,60],[85,61],[86,60],
            // Deep jungle south
            [57,62],[58,62],[59,63],[60,62],[61,63],[62,62],[63,63],
            [65,62],[66,62],[67,63],[68,62],[69,63],[70,62],[71,63],
            [73,62],[74,62],[75,63],[76,62],[77,62],[78,63],
            [80,63],[81,63],[82,63],[83,64],[84,63],[85,64],[86,63],
            [57,66],[58,66],[60,67],[62,66],[64,67],[66,66],[68,67],
            [70,66],[72,67],[74,66],[76,67],[78,66],[80,67],[82,66],
            [84,67],[86,66],[88,67],
            // Jungle extends to bottom-right corner
            [57,70],[60,70],[63,70],[66,70],[69,70],[72,70],[75,70],[78,70],
            [81,70],[84,70],[87,70],[90,70],
            [58,73],[61,73],[64,73],[67,73],[70,73],[73,73],[76,73],[79,73],
            [82,73],[85,73],[88,73],[91,73],
            [56,76],[59,76],[62,76],[65,76],[68,76],[71,76],[74,76],[77,76],
            [80,76],[83,76],[86,76],[89,76],[92,76],
            // East jungle border
            [94,36],[94,38],[94,40],[94,42],[94,44],[94,46],[94,48],
            [94,50],[94,52],[94,54],[94,56],[94,58],[94,60],[94,62],
            [95,37],[95,39],[95,41],[95,43],[95,45],[95,47],[95,49],
            [95,51],[95,53],[95,55],[95,57],[95,59],[95,61],
        ];

        // Coral positions for underwater
        const coralPositions = (!isUnderwater || isNewArea) ? [] : [
            [5,5],[6,5],[7,5],[15,6],[16,6],[17,6],[55,5],[56,5],[57,5],
            [62,8],[63,8],[8,15],[9,15],[50,15],[50,16],[60,20],[61,20],[62,20],
            [10,30],[11,30],[55,30],[56,30],[57,30],[20,38],[21,38],[22,38],
            [45,38],[45,39],[60,40],[61,40],[8,42],[9,42],[10,42],[50,44],[51,44],
        ];

        // Draw trees
        treePositions.forEach(([tx, ty]) => {
            const x = tx * tileSize + 8;
            const y = ty * tileSize + 8;
            const treeGfx = this.add.graphics().setDepth(4);
            // Trunk
            treeGfx.fillStyle(0x5d4037, 1);
            treeGfx.fillRect(x - 2, y - 2, 4, 10);
            // Canopy (layered circles for round look)
            const cSize = Phaser.Math.Between(7, 12);
            treeGfx.fillStyle(0x2e7d32, 1);
            treeGfx.fillCircle(x, y - 6, cSize);
            treeGfx.fillStyle(0x388e3c, 0.8);
            treeGfx.fillCircle(x - 2, y - 8, cSize - 2);
            // Highlight
            treeGfx.fillStyle(0x4caf50, 0.5);
            treeGfx.fillCircle(x - 2, y - 9, cSize - 4);
        });

        // Draw coral
        coralPositions.forEach(([tx, ty]) => {
            const x = tx * tileSize + 8;
            const y = ty * tileSize + 8;
            const coralGfx = this.add.graphics().setDepth(4);
            const colors = [0xe74c3c, 0xf39c12, 0x9b59b6, 0x2ecc71, 0xe91e63];
            const color = colors[Phaser.Math.Between(0, 4)];
            // Coral branches
            coralGfx.fillStyle(color, 0.9);
            coralGfx.fillRect(x - 1, y - 8, 3, 12);
            coralGfx.fillRect(x - 5, y - 5, 3, 8);
            coralGfx.fillRect(x + 3, y - 6, 3, 9);
            // Tips
            coralGfx.fillStyle(color, 0.5);
            coralGfx.fillCircle(x, y - 9, 3);
            coralGfx.fillCircle(x - 4, y - 6, 2);
            coralGfx.fillCircle(x + 4, y - 7, 2);
        });

        // --- STATIC GRASS TUFTS (drawn on shared graphics — no tweens!) ---
        if (!isUnderwater && !isElderHouse && !isNewArea) {
            const grassGfx = this.add.graphics().setDepth(1);
            for (let i = 0; i < 250; i++) {
                const bx = Phaser.Math.Between(tileSize * 2, worldW - tileSize * 2);
                const by = Phaser.Math.Between(tileSize * 2, worldH - tileSize * 2);
                const color = [0x4caf50, 0x66bb6a, 0x388e3c][Phaser.Math.Between(0, 2)];
                grassGfx.fillStyle(color, 0.6);
                grassGfx.fillRect(bx, by, 1, Phaser.Math.Between(3, 6));
            }
        }

        // --- FLOATING PARTICLES ---
        if (isNewArea) {
            // Particles handled by MapRenderer
        } else if (isElderHouse) {
            for (let i = 0; i < 6; i++) {
                const mote = this.add.circle(
                    Phaser.Math.Between(3 * tileSize, worldW - 3 * tileSize),
                    Phaser.Math.Between(3 * tileSize, worldH - 3 * tileSize),
                    1, 0xfff59d, 0.4
                ).setDepth(6);
                this.tweens.add({
                    targets: mote,
                    x: mote.x + Phaser.Math.Between(-30, 30),
                    y: mote.y + Phaser.Math.Between(-20, 20),
                    alpha: { from: 0.2, to: 0.5 },
                    duration: Phaser.Math.Between(3000, 6000),
                    yoyo: true, repeat: -1,
                    delay: Phaser.Math.Between(0, 3000)
                });
            }
        } else if (!isUnderwater) {
            // Floating leaves (reduced)
            for (let i = 0; i < 10; i++) {
                const leaf = this.add.rectangle(
                    Phaser.Math.Between(0, worldW),
                    Phaser.Math.Between(0, worldH),
                    3, 2, 0x8bc34a, 0.5
                ).setDepth(6);
                this.tweens.add({
                    targets: leaf,
                    x: leaf.x + Phaser.Math.Between(-100, 100),
                    y: leaf.y + Phaser.Math.Between(-60, 60),
                    angle: 360, alpha: { from: 0.5, to: 0 },
                    duration: Phaser.Math.Between(4000, 8000),
                    repeat: -1, delay: Phaser.Math.Between(0, 4000)
                });
            }

            // ===== BUTTERFLIES (6 total, spread across map) =====
            const butterflyColors = [0xff4081, 0x448aff, 0xffab00, 0xb388ff, 0x69f0ae, 0xff4081];
            for (let i = 0; i < 6; i++) {
                const bfx = Phaser.Math.Between(3 * tileSize, 95 * tileSize);
                const bfy = Phaser.Math.Between(3 * tileSize, 75 * tileSize);
                const bfColor = butterflyColors[i];
                const wing1 = this.add.ellipse(bfx - 2, bfy, 3, 4, bfColor, 0.7).setDepth(8);
                const wing2 = this.add.ellipse(bfx + 2, bfy, 3, 4, bfColor, 0.7).setDepth(8);
                this.tweens.add({
                    targets: wing1, scaleX: { from: 1, to: 0.2 },
                    duration: 200, yoyo: true, repeat: -1
                });
                this.tweens.add({
                    targets: wing2, scaleX: { from: 1, to: 0.2 },
                    duration: 200, yoyo: true, repeat: -1, delay: 100
                });
                const driftBoth = (targets) => {
                    this.tweens.add({
                        targets,
                        x: bfx + Phaser.Math.Between(-80, 80),
                        y: bfy + Phaser.Math.Between(-60, 60),
                        duration: Phaser.Math.Between(4000, 8000),
                        ease: 'Sine.easeInOut',
                        onComplete: () => driftBoth(targets)
                    });
                };
                driftBoth([wing1, wing2]);
            }

            // ===== BIRDS (2 flocks) =====
            for (let flock = 0; flock < 2; flock++) {
                const baseX = Phaser.Math.Between(0, worldW);
                const baseY = Phaser.Math.Between(20, 100);
                const birds = [];
                for (let b = 0; b < 5; b++) {
                    const bird = this.add.circle(baseX + (b-2)*8, baseY + Math.abs(b-2)*5, 1.5, 0x37474f, 0.7).setDepth(10);
                    birds.push(bird);
                }
                this.tweens.add({
                    targets: birds, x: '+=400',
                    duration: Phaser.Math.Between(12000, 20000), repeat: -1,
                    onRepeat: () => {
                        birds.forEach(bird => {
                            bird.x = -50 + Phaser.Math.Between(-20, 20);
                            bird.y = Phaser.Math.Between(20, 120);
                        });
                    }
                });
            }

            // ===== ALL STATIC DECORATIONS — batched into ONE graphics object =====
            const decoGfx = this.add.graphics().setDepth(2);

            // Flowers — all regions
            const flowerColors = [0xff4081, 0xffeb3b, 0x7c4dff, 0xff6e40, 0x00e5ff, 0xea80fc];
            const flowerRegions = [
                [2, 25, 50, 77],    // Main meadow (left half)
                [55, 3, 95, 30],    // Top-right
                [2, 55, 45, 77],    // Bottom-left
            ];
            flowerRegions.forEach(([x1, y1, x2, y2]) => {
                for (let i = 0; i < 50; i++) {
                    const fx = Phaser.Math.Between(x1 * tileSize, x2 * tileSize);
                    const fy = Phaser.Math.Between(y1 * tileSize, y2 * tileSize);
                    const fColor = flowerColors[Phaser.Math.Between(0, flowerColors.length - 1)];
                    decoGfx.fillStyle(0x388e3c, 0.8); decoGfx.fillRect(fx, fy, 1, 4);
                    decoGfx.fillStyle(fColor, 0.8); decoGfx.fillCircle(fx, fy - 1, 2);
                    decoGfx.fillStyle(0xffeb3b, 0.9); decoGfx.fillCircle(fx, fy - 1, 1);
                }
            });

            // Mushrooms
            [[6,6],[30,4],[48,17],[3,32],[5,47],[10,62],[22,64],[36,67],
             [43,72],[8,72],[25,50],[40,35],[34,20]].forEach(([mx, my]) => {
                const px = mx * tileSize + Phaser.Math.Between(-4, 4);
                const py = my * tileSize + Phaser.Math.Between(-4, 4);
                const isRed = Phaser.Math.Between(0, 1);
                decoGfx.fillStyle(0xd7ccc8, 1); decoGfx.fillRect(px - 1, py, 2, 4);
                decoGfx.fillStyle(isRed ? 0xe53935 : 0x8d6e63, 0.9); decoGfx.fillCircle(px, py - 1, 3);
                if (isRed) {
                    decoGfx.fillStyle(0xffffff, 0.8);
                    decoGfx.fillCircle(px - 1, py - 2, 1); decoGfx.fillCircle(px + 1, py - 1, 1);
                }
            });

            // Rocks
            [[28,40],[52,10],[45,45],[12,35],[38,58],[72,30],[82,20],
             [60,10],[20,70],[40,72],[55,25],[92,45],[88,15]].forEach(([rx, ry]) => {
                const px = rx * tileSize, py = ry * tileSize;
                const size = Phaser.Math.Between(4, 8);
                decoGfx.fillStyle(0x78909c, 0.8); decoGfx.fillCircle(px, py, size);
                decoGfx.fillStyle(0x90a4ae, 0.5); decoGfx.fillCircle(px - 1, py - 1, size - 2);
            });

            // ===== CAMPFIRE =====
            const campX = 48 * tileSize, campY = 38 * tileSize;
            const campGfx = this.add.graphics().setDepth(5);
            campGfx.fillStyle(0x616161, 0.8);
            for (let a = 0; a < 6; a++) {
                const angle = (a / 6) * Math.PI * 2;
                campGfx.fillCircle(campX + Math.cos(angle) * 7, campY + Math.sin(angle) * 7, 3);
            }
            campGfx.fillStyle(0x5d4037, 1);
            campGfx.fillRect(campX - 5, campY - 1, 10, 3);
            campGfx.fillRect(campX - 1, campY - 5, 3, 10);
            // Fire (3 flames)
            const fireColors = [0xff5722, 0xff9800, 0xffeb3b];
            for (let f = 0; f < 3; f++) {
                const flame = this.add.circle(campX, campY - 2 - f * 3, 4 - f, fireColors[f], 0.8).setDepth(6);
                this.tweens.add({
                    targets: flame,
                    scaleX: { from: 0.7, to: 1.3 }, scaleY: { from: 0.8, to: 1.4 },
                    alpha: { from: 0.5, to: 1 }, y: flame.y - 2,
                    duration: 300 + f * 100, yoyo: true, repeat: -1
                });
            }
            // Smoke (2 particles)
            for (let s = 0; s < 2; s++) {
                const smoke = this.add.circle(campX, campY - 8, 2, 0x9e9e9e, 0.3).setDepth(6);
                this.tweens.add({
                    targets: smoke,
                    y: smoke.y - Phaser.Math.Between(30, 50),
                    alpha: 0, scaleX: 2, scaleY: 2,
                    duration: Phaser.Math.Between(2000, 4000),
                    repeat: -1, delay: s * 1000,
                    onRepeat: () => { smoke.x = campX + Phaser.Math.Between(-3, 3); smoke.y = campY - 8; smoke.setScale(1); }
                });
            }

            // ===== BRIDGE, FENCES, SIGNPOST — batched into one graphics =====
            const structGfx = this.add.graphics().setDepth(3);
            // Bridge over village pond
            const bridgeX = 19 * tileSize, bridgeY = 28 * tileSize;
            structGfx.fillStyle(0x795548, 1);
            structGfx.fillRect(bridgeX, bridgeY, tileSize * 2, tileSize * 3);
            for (let p = 0; p < 3; p++) {
                structGfx.fillStyle(0x5d4037, 0.5);
                structGfx.fillRect(bridgeX, bridgeY + p * tileSize, tileSize * 2, 1);
            }
            structGfx.fillStyle(0x6d4c41, 1);
            structGfx.fillRect(bridgeX - 2, bridgeY, 2, tileSize * 3);
            structGfx.fillRect(bridgeX + tileSize * 2, bridgeY, 2, tileSize * 3);

            // Fences along road south of city
            for (let fy = 24; fy < 38; fy += 2) {
                structGfx.fillStyle(0x795548, 0.8);
                structGfx.fillRect(12 * tileSize, fy * tileSize, 2, tileSize * 2);
                structGfx.fillRect(12 * tileSize - 2, fy * tileSize + 4, 6, 2);
                structGfx.fillRect(12 * tileSize - 2, fy * tileSize + tileSize, 6, 2);
            }

            // Signpost at crossroads
            const signX = 49 * tileSize, signY = 39 * tileSize;
            const signGfx = this.add.graphics().setDepth(5);
            signGfx.fillStyle(0x5d4037, 1); signGfx.fillRect(signX, signY, 2, 14);
            signGfx.fillStyle(0x795548, 1);
            signGfx.fillRect(signX - 10, signY, 22, 6);
            signGfx.fillRect(signX - 8, signY + 7, 18, 5);
            signGfx.fillStyle(0x6d4c41, 1);
            signGfx.fillTriangle(signX - 12, signY + 3, signX - 10, signY, signX - 10, signY + 6);
            signGfx.fillTriangle(signX + 12, signY + 9, signX + 10, signY + 7, signX + 10, signY + 12);

            // ===== JUNGLE UNDERGROWTH — batched into ONE graphics object =====
            const jungleGfx = this.add.graphics().setDepth(3);
            // General jungle bushes
            for (let i = 0; i < 200; i++) {
                const ux = Phaser.Math.Between(55 * tileSize, 96 * tileSize);
                const uy = Phaser.Math.Between(34 * tileSize, 78 * tileSize);
                const bushSize = Phaser.Math.Between(4, 9);
                jungleGfx.fillStyle(0x1b5e20, Phaser.Math.FloatBetween(0.6, 0.9));
                jungleGfx.fillCircle(ux, uy, bushSize);
                jungleGfx.fillStyle(0x2e7d32, 0.5);
                jungleGfx.fillCircle(ux - 1, uy - 1, bushSize - 1);
            }
            // Extra dense around the pond
            for (let i = 0; i < 80; i++) {
                const ux = Phaser.Math.Between(63 * tileSize, 80 * tileSize);
                const uy = Phaser.Math.Between(48 * tileSize, 62 * tileSize);
                const bushSize = Phaser.Math.Between(5, 10);
                jungleGfx.fillStyle(0x1b5e20, Phaser.Math.FloatBetween(0.7, 1.0));
                jungleGfx.fillCircle(ux, uy, bushSize);
                jungleGfx.fillStyle(0x0d3b0d, 0.5);
                jungleGfx.fillCircle(ux + 1, uy + 1, bushSize - 1);
            }
            // Vines
            const vineGfx = this.add.graphics().setDepth(5);
            for (let v = 0; v < 40; v++) {
                const vx = Phaser.Math.Between(55 * tileSize, 96 * tileSize);
                const vy = Phaser.Math.Between(34 * tileSize, 76 * tileSize);
                vineGfx.lineStyle(1, 0x33691e, 0.7);
                vineGfx.beginPath(); vineGfx.moveTo(vx, vy);
                vineGfx.lineTo(vx + Phaser.Math.Between(-5, 5), vy + 8);
                vineGfx.lineTo(vx + Phaser.Math.Between(-3, 3), vy + 16);
                vineGfx.lineTo(vx + Phaser.Math.Between(-6, 6), vy + 22);
                vineGfx.strokePath();
                vineGfx.fillStyle(0x2e7d32, 0.6);
                vineGfx.fillCircle(vx + Phaser.Math.Between(-4, 4), vy + 22, 2);
            }

            // Signpost labels
            this.add.text(signX - 2, signY + 2, '← City', {
                fontSize: '6px', fontFamily: 'Nunito', fontStyle: 'bold',
                color: '#ffffff', stroke: '#000000', strokeThickness: 3,
                resolution: 2
            }).setOrigin(0.5).setDepth(6);
            this.add.text(signX + 2, signY + 9, 'Jungle →', {
                fontSize: '6px', fontFamily: 'Nunito', fontStyle: 'bold',
                color: '#ffffff', stroke: '#000000', strokeThickness: 3,
                resolution: 2
            }).setOrigin(0.5).setDepth(6);

        } else if (isUnderwater) {
            // Underwater: floating bubbles
            for (let i = 0; i < 15; i++) {
                const bubble = this.add.circle(
                    Phaser.Math.Between(0, worldW),
                    Phaser.Math.Between(0, worldH),
                    Phaser.Math.Between(1, 3), 0x64b5f6, 0.4
                ).setDepth(6);
                this.tweens.add({
                    targets: bubble,
                    y: bubble.y - Phaser.Math.Between(60, 150),
                    alpha: 0,
                    duration: Phaser.Math.Between(3000, 7000),
                    repeat: -1, delay: Phaser.Math.Between(0, 4000),
                    onRepeat: () => {
                        bubble.x = Phaser.Math.Between(0, worldW);
                        bubble.y = Phaser.Math.Between(worldH * 0.3, worldH);
                    }
                });
            }
        }

        // --- BUILDINGS & CITY ---
        this.buildingBodies = this.physics.add.staticGroup();

        // Helper: draw a house and add collision
        const drawHouse = (tx, ty, tw, th, style) => {
            const x = tx * tileSize, y = ty * tileSize;
            const w = tw * tileSize, h = th * tileSize;
            const bGfx = this.add.graphics().setDepth(5);
            if (style === 'ruins') {
                bGfx.fillStyle(0x37474f, 0.9); bGfx.fillRect(x, y + 4, w, h - 4);
                bGfx.fillStyle(0x546e7a, 1);
                bGfx.fillRect(x + 2, y, 4, h); bGfx.fillRect(x + w - 6, y, 4, h);
                bGfx.fillStyle(0x546e7a, 1); bGfx.fillRect(x, y, w, 4);
                bGfx.fillStyle(0x29b6f6, 0.2); bGfx.fillRect(x + 8, y + 6, w - 16, h - 10);
            } else {
                bGfx.fillStyle(0xd7ccc8, 1); bGfx.fillRect(x, y + 6, w, h - 6);
                bGfx.fillStyle(0x8d6e63, 1); bGfx.fillRect(x - 2, y, w + 4, 8);
                bGfx.fillStyle(0x795548, 1); bGfx.fillRect(x, y + 2, w, 4);
                bGfx.fillStyle(0x5d4037, 1); bGfx.fillRect(x + w / 2 - 3, y + h - 12, 6, 12);
                if (w > 20) {
                    bGfx.fillStyle(0xfff59d, 0.8);
                    bGfx.fillRect(x + 4, y + 10, 5, 5);
                    bGfx.fillRect(x + w - 9, y + 10, 5, 5);
                }
            }
            const body = this.buildingBodies.create(x + w / 2, y + h / 2, null);
            body.setVisible(false); body.body.setSize(w, h);
            body.setOrigin(0.5); body.refreshBody();
        };

        if (isNewArea) {
            // Buildings handled by MapRenderer
        } else if (isElderHouse) {
            // ===== ELDER'S HOUSE INTERIOR =====
            const wallGfx = this.add.graphics().setDepth(5);
            // Stone walls around the room
            wallGfx.fillStyle(0x795548, 1);
            wallGfx.fillRect(0, 0, worldW, 2 * tileSize); // Top wall
            wallGfx.fillRect(0, 0, 2 * tileSize, worldH); // Left wall
            wallGfx.fillRect(worldW - 2 * tileSize, 0, 2 * tileSize, worldH); // Right wall
            wallGfx.fillRect(0, worldH - 2 * tileSize, worldW, 2 * tileSize); // Bottom wall
            // Wall texture
            wallGfx.fillStyle(0x6d4c41, 0.5);
            for (let bx = 0; bx < worldW; bx += 8) {
                wallGfx.fillRect(bx, 0, 7, 2 * tileSize);
                wallGfx.fillRect(bx, worldH - 2 * tileSize, 7, 2 * tileSize);
            }
            // Door opening at bottom center
            wallGfx.fillStyle(0x6d4c2e, 1); // Match floor
            wallGfx.fillRect(6 * tileSize, worldH - 2 * tileSize, 2 * tileSize, 2 * tileSize);
            // Door frame
            wallGfx.fillStyle(0x5d4037, 1);
            wallGfx.fillRect(6 * tileSize - 2, worldH - 2 * tileSize, 2, 2 * tileSize);
            wallGfx.fillRect(8 * tileSize, worldH - 2 * tileSize, 2, 2 * tileSize);

            // Furniture: table
            const furnGfx = this.add.graphics().setDepth(6);
            furnGfx.fillStyle(0x5d4037, 1);
            furnGfx.fillRect(5 * tileSize, 4 * tileSize, 4 * tileSize, 2 * tileSize);
            furnGfx.fillStyle(0x4e342e, 1);
            furnGfx.fillRect(5 * tileSize + 2, 4 * tileSize + 2, 4 * tileSize - 4, 2 * tileSize - 4);
            // Candle on table
            furnGfx.fillStyle(0xfff59d, 0.9);
            furnGfx.fillRect(7 * tileSize, 4 * tileSize + 4, 3, 6);
            furnGfx.fillStyle(0xff9800, 0.8);
            furnGfx.fillCircle(7 * tileSize + 1, 4 * tileSize + 3, 3);

            // Bookshelf on left wall
            furnGfx.fillStyle(0x5d4037, 1);
            furnGfx.fillRect(2 * tileSize, 3 * tileSize, 2 * tileSize, 4 * tileSize);
            const bookColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6];
            for (let by = 0; by < 4; by++) {
                for (let bx = 0; bx < 3; bx++) {
                    furnGfx.fillStyle(bookColors[Phaser.Math.Between(0, 4)], 0.9);
                    furnGfx.fillRect(2 * tileSize + 4 + bx * 8, 3 * tileSize + 4 + by * 14, 6, 12);
                }
            }

            // Fireplace on right wall
            furnGfx.fillStyle(0x546e7a, 1);
            furnGfx.fillRect(10 * tileSize, 3 * tileSize, 2 * tileSize, 3 * tileSize);
            furnGfx.fillStyle(0x37474f, 1);
            furnGfx.fillRect(10 * tileSize + 4, 3 * tileSize + 8, 2 * tileSize - 8, 3 * tileSize - 12);
            // Fire glow
            furnGfx.fillStyle(0xff5722, 0.6);
            furnGfx.fillCircle(11 * tileSize, 5 * tileSize, 8);
            furnGfx.fillStyle(0xffab00, 0.4);
            furnGfx.fillCircle(11 * tileSize, 5 * tileSize - 3, 5);

            // Door mat near the exit
            const matGfx = this.add.graphics().setDepth(1);
            matGfx.fillStyle(0x8d6e63, 0.6);
            matGfx.fillRoundedRect(6 * tileSize + 2, worldH - 2 * tileSize - 6, 2 * tileSize - 4, 5, 2);
            // Exit label
            this.add.text(7 * tileSize, worldH - 3 * tileSize - 4, 'Exit', {
                fontSize: '10px', fontFamily: 'Nunito', fontStyle: 'bold',
                color: '#ffffff', stroke: '#000000', strokeThickness: 4,
                resolution: 2
            }).setOrigin(0.5).setDepth(7);

            // Wall collision bodies (top, left, right, bottom-left, bottom-right — gap for door)
            const addWallBody = (bx, by, bw, bh) => {
                const b = this.buildingBodies.create(bx + bw/2, by + bh/2, null);
                b.setVisible(false); b.body.setSize(bw, bh); b.setOrigin(0.5); b.refreshBody();
            };
            addWallBody(0, 0, worldW, 2 * tileSize);
            addWallBody(0, 0, 2 * tileSize, worldH);
            addWallBody(worldW - 2 * tileSize, 0, 2 * tileSize, worldH);
            addWallBody(0, worldH - 2 * tileSize, 6 * tileSize, 2 * tileSize);
            addWallBody(8 * tileSize, worldH - 2 * tileSize, worldW - 8 * tileSize, 2 * tileSize);

        } else if (isUnderwater) {
            // Underwater ruins
            const ruinPositions = [
                [33,23,4,3],[15,18,3,2],[50,20,3,2],[25,35,3,2],
                [45,35,3,2],[35,10,2,2],[20,42,2,2],[55,42,3,2]
            ];
            ruinPositions.forEach(([tx,ty,tw,th]) => drawHouse(tx,ty,tw,th,'ruins'));
        } else {
            // ===== GREENWOOD CITY =====
            // City walls (stone) — city spans tiles 4-26, 5-21
            const cityGfx = this.add.graphics().setDepth(3);
            const cx1 = 4 * tileSize, cy1 = 5 * tileSize;
            const cx2 = 26 * tileSize, cy2 = 21 * tileSize;
            const wallThick = 8;

            // Cobblestone ground inside city (draw first so walls go on top)
            const cityFloor = this.add.graphics().setDepth(0.5);
            cityFloor.fillStyle(0x8d8d6e, 0.45);
            cityFloor.fillRect(cx1 + wallThick, cy1 + wallThick, cx2 - cx1 - wallThick * 2, cy2 - cy1 - wallThick * 2);
            for (let sx = cx1 + 10; sx < cx2 - 10; sx += 6) {
                for (let sy = cy1 + 10; sy < cy2 - 10; sy += 6) {
                    cityFloor.fillStyle(0x9e9e7e, Phaser.Math.FloatBetween(0.2, 0.5));
                    cityFloor.fillRect(sx, sy, 5, 5);
                }
            }

            // Stone wall base (darker stone)
            cityGfx.fillStyle(0x546e7a, 1);
            cityGfx.fillRect(cx1, cy1, cx2 - cx1, wallThick);           // top
            cityGfx.fillRect(cx1, cy1, wallThick, cy2 - cy1);           // left
            cityGfx.fillRect(cx2 - wallThick, cy1, wallThick, cy2 - cy1); // right
            cityGfx.fillRect(cx1, cy2 - wallThick, (13 * tileSize) - cx1, wallThick); // bottom-left
            cityGfx.fillRect(16 * tileSize, cy2 - wallThick, cx2 - 16 * tileSize, wallThick); // bottom-right

            // Stone block texture on walls
            for (let wx = cx1; wx < cx2; wx += 8) {
                for (let row = 0; row < 2; row++) {
                    const offset = row % 2 === 0 ? 0 : 4;
                    cityGfx.fillStyle(0x78909c, Phaser.Math.FloatBetween(0.4, 0.7));
                    cityGfx.fillRect(wx + offset, cy1 + row * 4, 7, 3);
                    cityGfx.fillRect(wx + offset, cy2 - wallThick + row * 4, 7, 3);
                }
            }
            for (let wy = cy1; wy < cy2; wy += 8) {
                for (let col = 0; col < 2; col++) {
                    const offset = col % 2 === 0 ? 0 : 4;
                    cityGfx.fillStyle(0x78909c, Phaser.Math.FloatBetween(0.4, 0.7));
                    cityGfx.fillRect(cx1 + col * 4, wy + offset, 3, 7);
                    cityGfx.fillRect(cx2 - wallThick + col * 4, wy + offset, 3, 7);
                }
            }

            // Battlements (crenellations) along top wall
            for (let bx = cx1; bx < cx2; bx += 10) {
                cityGfx.fillStyle(0x607d8b, 1);
                cityGfx.fillRect(bx, cy1 - 4, 6, 5);
            }
            // Battlements along left/right walls
            for (let by = cy1; by < cy2; by += 10) {
                cityGfx.fillStyle(0x607d8b, 1);
                cityGfx.fillRect(cx1 - 4, by, 5, 6);
                cityGfx.fillRect(cx2 - 1, by, 5, 6);
            }

            // Corner towers (4 thick square towers)
            const towerSize = 14;
            const towerPositions = [
                [cx1 - 3, cy1 - 3],                       // top-left
                [cx2 - towerSize + 3, cy1 - 3],           // top-right
                [cx1 - 3, cy2 - towerSize + 3],           // bottom-left
                [cx2 - towerSize + 3, cy2 - towerSize + 3] // bottom-right
            ];
            towerPositions.forEach(([tx, ty]) => {
                // Tower base
                cityGfx.fillStyle(0x455a64, 1);
                cityGfx.fillRect(tx, ty, towerSize, towerSize);
                // Tower stone texture
                cityGfx.fillStyle(0x546e7a, 0.6);
                cityGfx.fillRect(tx + 2, ty + 2, towerSize - 4, towerSize - 4);
                // Tower top rim
                cityGfx.fillStyle(0x607d8b, 1);
                cityGfx.fillRect(tx - 1, ty - 1, towerSize + 2, 3);
                cityGfx.fillRect(tx - 1, ty - 1, 3, towerSize + 2);
                // Arrow slit
                cityGfx.fillStyle(0x263238, 0.8);
                cityGfx.fillRect(tx + towerSize / 2 - 1, ty + 4, 2, 6);
            });

            // Gate towers (tall pillars flanking the entrance)
            const gateLeft = 13 * tileSize, gateRight = 16 * tileSize;
            cityGfx.fillStyle(0x455a64, 1);
            cityGfx.fillRect(gateLeft - 6, cy2 - 18, 10, 20);
            cityGfx.fillRect(gateRight - 4, cy2 - 18, 10, 20);
            // Tower caps
            cityGfx.fillStyle(0x607d8b, 1);
            cityGfx.fillRect(gateLeft - 8, cy2 - 22, 14, 5);
            cityGfx.fillRect(gateRight - 6, cy2 - 22, 14, 5);
            // Mini battlements on gate towers
            cityGfx.fillStyle(0x546e7a, 1);
            cityGfx.fillRect(gateLeft - 8, cy2 - 25, 4, 4);
            cityGfx.fillRect(gateLeft + 2, cy2 - 25, 4, 4);
            cityGfx.fillRect(gateRight - 6, cy2 - 25, 4, 4);
            cityGfx.fillRect(gateRight + 4, cy2 - 25, 4, 4);

            // Gate arch (wooden beam across the top)
            cityGfx.fillStyle(0x5d4037, 0.9);
            cityGfx.fillRect(gateLeft + 4, cy2 - 14, gateRight - gateLeft - 8, 4);
            cityGfx.fillStyle(0x795548, 0.6);
            cityGfx.fillRect(gateLeft + 4, cy2 - 12, gateRight - gateLeft - 8, 2);

            // Greenwood Village label
            this.add.text((gateLeft + gateRight) / 2, cy2 - 26, 'Greenwood Village', {
                fontSize: '10px', fontFamily: 'Nunito', fontStyle: 'bold',
                color: '#ffffff', stroke: '#000000', strokeThickness: 4,
                resolution: 2
            }).setOrigin(0.5).setDepth(7);

            // Banner hanging from gate arch
            const bannerGfx = this.add.graphics().setDepth(4);
            const bannerX = (gateLeft + gateRight) / 2;
            bannerGfx.fillStyle(0xc62828, 0.9);
            bannerGfx.fillRect(bannerX - 5, cy2 - 13, 10, 14);
            bannerGfx.fillTriangle(bannerX - 5, cy2 + 1, bannerX + 5, cy2 + 1, bannerX, cy2 + 6);
            // Banner emblem (gold diamond)
            bannerGfx.fillStyle(0xffd700, 0.8);
            bannerGfx.fillTriangle(bannerX, cy2 - 10, bannerX - 3, cy2 - 6, bannerX + 3, cy2 - 6);
            bannerGfx.fillTriangle(bannerX, cy2 - 2, bannerX - 3, cy2 - 6, bannerX + 3, cy2 - 6);
            // Banner sway
            this.tweens.add({
                targets: bannerGfx, angle: { from: -2, to: 2 },
                duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });

            // Torch flames at gate (animated)
            [gateLeft - 2, gateRight + 2].forEach(torchX => {
                // Torch bracket
                cityGfx.fillStyle(0x5d4037, 1);
                cityGfx.fillRect(torchX - 1, cy2 - 18, 3, 4);
                const flame = this.add.circle(torchX, cy2 - 20, 3, 0xff9800, 0.8).setDepth(7);
                this.tweens.add({
                    targets: flame,
                    scaleX: { from: 0.8, to: 1.3 }, scaleY: { from: 0.8, to: 1.4 },
                    alpha: { from: 0.6, to: 1 },
                    duration: 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
                });
                const glow = this.add.circle(torchX, cy2 - 18, 12, 0xff9800, 0.12).setDepth(6);
                this.tweens.add({
                    targets: glow, alpha: { from: 0.08, to: 0.18 },
                    duration: 600, yoyo: true, repeat: -1
                });
            });

            // Wall torches inside city (along walls)
            [cx1 + wallThick + 4, cx2 - wallThick - 4].forEach(torchX => {
                [cy1 + 30, cy1 + 70, cy1 + 110].forEach(torchY => {
                    const iFlame = this.add.circle(torchX, torchY, 2, 0xff9800, 0.6).setDepth(7);
                    this.tweens.add({
                        targets: iFlame, scaleX: { from: 0.7, to: 1.2 }, alpha: { from: 0.4, to: 0.8 },
                        duration: 350, yoyo: true, repeat: -1
                    });
                });
            });

            // Wall collision bodies
            const addWallBody = (bx, by, bw, bh) => {
                const b = this.buildingBodies.create(bx + bw/2, by + bh/2, null);
                b.setVisible(false); b.body.setSize(bw, bh); b.setOrigin(0.5); b.refreshBody();
            };
            addWallBody(cx1, cy1, cx2 - cx1, wallThick); // top
            addWallBody(cx1, cy1, wallThick, cy2 - cy1); // left
            addWallBody(cx2 - wallThick, cy1, wallThick, cy2 - cy1); // right
            addWallBody(cx1, cy2 - wallThick, (13 * tileSize) - cx1, wallThick); // bottom-left
            addWallBody(16 * tileSize, cy2 - wallThick, cx2 - 16 * tileSize, wallThick); // bottom-right

            // === SHOPKEEPER MARKET STAND ===
            const standGfx = this.add.graphics().setDepth(5);
            const standX = 16 * tileSize, standY = 13 * tileSize;
            // Wooden counter
            standGfx.fillStyle(0x795548, 1);
            standGfx.fillRect(standX, standY, 4 * tileSize, 2 * tileSize);
            standGfx.fillStyle(0x5d4037, 1);
            standGfx.fillRect(standX + 2, standY + 2, 4 * tileSize - 4, 2 * tileSize - 4);
            // Awning/canopy over the stand
            standGfx.fillStyle(0xc62828, 0.8);
            standGfx.fillRect(standX - 4, standY - 8, 4 * tileSize + 8, 8);
            standGfx.fillStyle(0xfdd835, 0.6);
            for (let sx = standX - 2; sx < standX + 4 * tileSize + 4; sx += 10) {
                standGfx.fillRect(sx, standY - 8, 5, 8);
            }
            // Items on stand (colored boxes = wares)
            const wareColors = [0xffd700, 0xc0c0c0, 0x8d6e63, 0x42a5f5];
            for (let i = 0; i < 4; i++) {
                standGfx.fillStyle(wareColors[i], 0.9);
                standGfx.fillRect(standX + 6 + i * 12, standY + 5, 8, 8);
            }
            // Stand collision (player can't walk through the counter)
            addWallBody(standX, standY, 4 * tileSize, 2 * tileSize);

            // === ELDER'S HOUSE (special — has enterable door) ===
            const elderHouseX = 7 * tileSize, elderHouseY = 8 * tileSize;
            const elderHouseW = 4 * tileSize, elderHouseH = 3 * tileSize;
            const ehGfx = this.add.graphics().setDepth(5);
            // Walls
            ehGfx.fillStyle(0xbcaaa4, 1);
            ehGfx.fillRect(elderHouseX, elderHouseY + 6, elderHouseW, elderHouseH - 6);
            // Roof
            ehGfx.fillStyle(0x6d4c41, 1);
            ehGfx.fillRect(elderHouseX - 3, elderHouseY, elderHouseW + 6, 10);
            ehGfx.fillStyle(0x5d4037, 1);
            ehGfx.fillRect(elderHouseX - 1, elderHouseY + 3, elderHouseW + 2, 5);
            // Glowing door (shows it's enterable)
            ehGfx.fillStyle(0xffa726, 0.9);
            ehGfx.fillRect(elderHouseX + elderHouseW / 2 - 4, elderHouseY + elderHouseH - 14, 8, 14);
            // Windows
            ehGfx.fillStyle(0xfff59d, 0.8);
            ehGfx.fillRect(elderHouseX + 4, elderHouseY + 12, 6, 6);
            ehGfx.fillRect(elderHouseX + elderHouseW - 10, elderHouseY + 12, 6, 6);
            // Elder's Home label
            this.add.text(elderHouseX + elderHouseW / 2, elderHouseY - 8, "Elder's Home", {
                fontSize: '10px', fontFamily: 'Nunito', fontStyle: 'bold',
                color: '#ffffff', stroke: '#000000', strokeThickness: 4,
                resolution: 2
            }).setOrigin(0.5).setDepth(7);
            // Store the whole house area as the teleport zone (walk into the house to enter)
            this.elderDoor = {
                x: elderHouseX,
                y: elderHouseY,
                w: elderHouseW,
                h: elderHouseH
            };
            // No collision on elder's house — player walks through door to teleport

            // === OTHER CITY HOUSES ===
            drawHouse(8, 14, 3, 2, 'house');   // House near elder's
            drawHouse(20, 8, 3, 2, 'house');   // Right side house
            drawHouse(20, 14, 3, 2, 'house');  // Right side house 2

            // City well (center of city)
            const wellGfx = this.add.graphics().setDepth(5);
            const wellX = 14 * tileSize, wellY = 9 * tileSize;
            wellGfx.fillStyle(0x78909c, 1);
            wellGfx.fillCircle(wellX, wellY, 10);
            wellGfx.fillStyle(0x1976d2, 0.8);
            wellGfx.fillCircle(wellX, wellY, 6);
            wellGfx.fillStyle(0x42a5f5, 0.4);
            wellGfx.fillCircle(wellX - 2, wellY - 2, 3);
            addWallBody(wellX - 10, wellY - 10, 20, 20);

            // === HOUSES OUTSIDE CITY (scattered around the world) ===
            drawHouse(35, 38, 3, 2, 'house');  // Near crossroads
            drawHouse(45, 20, 2, 2, 'house');  // Northeast outpost
            drawHouse(30, 55, 3, 2, 'house');  // Southern house
            drawHouse(8, 50, 3, 2, 'house');   // Southwest house
            drawHouse(48, 62, 2, 2, 'house');  // Southeast house
        }

        // --- NEW AREAS (3-10) rendered by MapRenderer ---
        if (isNewArea) {
            const renderer = new MapRenderer(this, tileSize);
            const result = renderer.render(this.currentAreaId, worldW, worldH, this.buildingBodies);
            if (result.waterZones) {
                this.waterZones = result.waterZones;
            }
            // Store the specific portal zone for teleporting back
            this.returnPortalZone = result.portalZone || null;
        }

        // --- AREA PORTALS in area1 (connect to all other areas) ---
        if (this.currentAreaId === 'area1') {
            const portalGfx = this.add.graphics().setDepth(3);
            // Portal data: [tileX, tileY, width, height, areaId, requiredLevel, color, label]
            this.areaPortals = [
                // Hidden pond to area2 already handled separately
                { tx: 3, ty: 35, tw: 3, th: 3, areaId: 'area3', level: 7, color: 0x556b2f, label: 'Murkveil Swamp' },
                { tx: 3, ty: 55, tw: 3, th: 3, areaId: 'area4', level: 9, color: 0xd4a017, label: 'Sunscorch Desert' },
                { tx: 3, ty: 70, tw: 3, th: 3, areaId: 'area5', level: 11, color: 0xff4500, label: 'Emberpeak Volcano' },
                { tx: 90, ty: 10, tw: 3, th: 3, areaId: 'area6', level: 13, color: 0x87ceeb, label: 'Frosthollow Tundra' },
                { tx: 90, ty: 25, tw: 3, th: 3, areaId: 'area7', level: 15, color: 0x708090, label: 'Dreadmoor Castle' },
                { tx: 35, ty: 2, tw: 3, th: 3, areaId: 'area8', level: 16, color: 0x9370db, label: 'Crystalvein Caverns' },
                { tx: 50, ty: 72, tw: 3, th: 3, areaId: 'area9', level: 18, color: 0xffd700, label: 'Skyreach Temple' },
                { tx: 80, ty: 72, tw: 3, th: 3, areaId: 'area10', level: 19, color: 0x9932cc, label: 'Shadow Realm' },
            ];

            this.areaPortals.forEach(p => {
                const px = p.tx * tileSize, py = p.ty * tileSize;
                const pw = p.tw * tileSize, ph = p.th * tileSize;
                // Portal base
                portalGfx.fillStyle(p.color, 0.3);
                portalGfx.fillRoundedRect(px, py, pw, ph, 6);
                portalGfx.lineStyle(2, p.color, 0.6);
                portalGfx.strokeRoundedRect(px - 2, py - 2, pw + 4, ph + 4, 8);
                // Pulsing glow
                const glow = this.add.graphics().setDepth(3);
                glow.fillStyle(p.color, 0.15);
                glow.fillRoundedRect(px, py, pw, ph, 4);
                this.tweens.add({
                    targets: glow, alpha: { from: 0.3, to: 0.8 },
                    duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
                });
                // Label
                this.add.text(px + pw / 2, py - 8, p.label, {
                    fontSize: '7px', fontFamily: 'Nunito', fontStyle: 'bold',
                    color: '#ffffff', stroke: '#000000', strokeThickness: 3,
                    resolution: 2
                }).setOrigin(0.5).setDepth(7);
                // Level requirement label
                this.add.text(px + pw / 2, py + ph + 6, 'Lv.' + p.level, {
                    fontSize: '6px', fontFamily: 'Nunito',
                    color: '#aaaaaa', stroke: '#000000', strokeThickness: 2,
                    resolution: 2
                }).setOrigin(0.5).setDepth(7);
            });
        }

        // --- WORLD BOUNDS ---
        this.physics.world.setBounds(0, 0, worldW, worldH);

        // --- SPAWN PLAYER ---
        const spawn = this.overrideSpawn || this.currentArea.playerSpawn;
        const spawnX = spawn.x * tileSize;
        const spawnY = spawn.y * tileSize;
        this.player = new Player(this, spawnX, spawnY);

        // Restore player stats
        if (this.savedPlayerStats) {
            const s = this.savedPlayerStats;
            this.player.level = s.level;
            this.player.xp = s.xp;
            this.player.gold = s.gold;
            this.player.maxHP = s.maxHP;
            this.player.hp = s.hp;
            this.player.moveSpeed = s.moveSpeed;
            this.player.attackPower = s.attackPower;
            this.player.defense = s.defense;
            if (s.equippedWeapon) this.player.equippedWeapon = s.equippedWeapon;
            if (s.equippedArmor) this.player.equippedArmor = s.equippedArmor;
            if (s.inventory) this.player.inventory = [...s.inventory];
            if (s.potions) this.player.potions = { ...s.potions };
        }

        // --- CAMERA ---
        // Start with instant follow (1,1) so camera snaps to player immediately
        this.cameras.main.startFollow(this.player, true, 1, 1);
        // After a short delay, ease to smooth follow
        this.time.delayedCall(100, () => {
            this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        });
        this.cameras.main.setBounds(0, 0, worldW, worldH);
        this.cameras.main.setZoom(isElderHouse ? 2.8 : 2.0);
        const bgColor = isElderHouse ? '#2a1a0a' : (isUnderwater ? '#0a1628' : '#1a1a2e');
        this.cameras.main.setBackgroundColor(bgColor);

        // --- COLLISIONS ---
        this.physics.add.collider(this.player, this.buildingBodies);

        // --- LAUNCH THE HUD ---
        // bringToTop ensures UIScene renders AFTER (on top of) GameScene
        this.scene.launch('UI');
        this.scene.bringToTop('UI');
        this.uiScene = this.scene.get('UI');

        // --- SOUND + MUSIC SYSTEM ---
        // Singletons so they survive scene restarts (area transitions restart the scene)
        if (!window._gameSound) window._gameSound = new SoundManager();
        this.soundManager = window._gameSound;
        if (!window._gameMusic) window._gameMusic = new MusicManager();
        this.musicManager = window._gameMusic;
        this.musicManager.play(this.currentAreaId);

        // --- COMBAT SYSTEM ---
        this.combatSystem = new CombatSystem(this);

        // Space key for attacking
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // --- QUEST SYSTEM ---
        this.questManager = new QuestManager(this);
        this.activeQuestId = null;
        this.spawnTimer = null;

        // Restore quest states from previous area
        if (this.savedQuestStates) {
            this.questManager.questStates = this.savedQuestStates.states;
            this.questManager.questProgress = this.savedQuestStates.progress;
            this.questManager.questKillRewards = this.savedQuestStates.killRewards;
        }

        // E key for talking to NPCs
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.dialogOpen = false;
        this.dialogCooldown = 0;

        // I key for inventory
        this.inventoryOpen = false;
        this.inventoryKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
        this.inventoryKey.on('down', () => {
            if (this.dialogOpen || this.player.isDead) return;
            if (this.inventoryOpen) {
                this.scene.stop('Inventory');
                this.inventoryOpen = false;
            } else {
                this.inventoryOpen = true;
                this.scene.launch('Inventory', { player: this.player });
            }
        });

        // Admin panel (press ` backtick to open)
        this.adminKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKTICK);
        this.adminKey.on('down', () => {
            if (this.dialogOpen || this.player.isDead) return;
            this.scene.launch('Admin', { player: this.player });
            this.dialogOpen = true;
        });

        // Guide arrow and "Press E" prompt are rendered in UIScene for crisp text
        this.guideState = { type: 'none' };

        // --- ENEMIES (spawned by quest system, not on load) ---
        this.enemies = this.physics.add.group();

        // Store collision group for enemy spawning
        this.collisionLayers = { buildings: this.buildingBodies };

        // Enemies collide with buildings and each other
        this.physics.add.collider(this.enemies, this.buildingBodies);
        this.physics.add.collider(this.enemies, this.enemies);

        // Resume quest spawning if returning with an active quest
        if (this.savedQuestStates) {
            for (const qId in this.questManager.questStates) {
                if (this.questManager.questStates[qId] === 'active' && QUESTS[qId] && QUESTS[qId].target) {
                    if (this.currentAreaId === 'area1') {
                        this.startQuestSpawning(qId);
                    }
                    // Delay HUD update so UIScene has time to finish its create()
                    this.time.delayedCall(100, () => {
                        if (this.uiScene && this.uiScene.updateQuestTracker) {
                            this.uiScene.updateQuestTracker(qId);
                        }
                    });
                    break;
                }
            }
        }

        // --- TREASURE CHESTS (area1 only) ---
        if (!isUnderwater && !isElderHouse && !isNewArea) {
        const chestData = [
            { x: 22, y: 42, gold: 5 },    // Near the crossroads
            { x: 42, y: 42, gold: 8 },    // Along the horizontal path
            { x: 5, y: 15, gold: 15 },    // Behind trees west side
            { x: 47, y: 12, gold: 15 },   // Beside the north outpost
            { x: 25, y: 35, gold: 12 },   // Beside a house
            { x: 13, y: 50, gold: 12 },   // Below the southern village hut
            { x: 6, y: 60, gold: 25 },    // Deep in bottom-left forest
            { x: 88, y: 5, gold: 25 },    // Top-right corner
            { x: 92, y: 70, gold: 30 },   // Bottom-right corner
            { x: 63, y: 14, gold: 20 },   // Beside northeast area
            { x: 4, y: 4, gold: 50 },     // Extreme top-left corner, behind trees
            { x: 31, y: 68, gold: 40 },   // Deep bottom-center
        ];

        this.chests = [];
        chestData.forEach(data => {
            const chestSprite = this.physics.add.sprite(
                data.x * tileSize, data.y * tileSize,
                'chest'
            ).setDepth(8).setImmovable(true);

            chestSprite.goldReward = data.gold;
            chestSprite.isOpened = false;

            this.physics.add.overlap(this.player, chestSprite, () => {
                this.openChest(chestSprite);
            });

            this.chests.push(chestSprite);
        });
        }

        // --- AREA NAME POPUP ---
        // We show this in the UIScene since it has its own un-zoomed camera
        // (handled by UIScene's create method already showing area name)

        // --- NPCs ---
        // NPCs now use real spritesheets (recolored versions of the player).
        // We pick the right texture based on the NPC's id.
        const NPC_TEXTURES = {
            'npc_elder': 'npc-elder-sheet',
            'npc_shopkeeper': 'npc-shopkeeper-sheet',
            'npc_sea_elder': 'npc',
            'npc_sea_merchant': 'npc'
        };
        const NPC_ANIMS = {
            'npc_elder': 'npc-elder-idle',
            'npc_shopkeeper': 'npc-shopkeeper-idle'
        };
        // Tints for NPCs without unique spritesheets
        const NPC_TINTS = {
            'npc_sea_elder': 0x3498db,
            'npc_sea_merchant': 0x1ABC9C
        };
        this.npcs = [];
        for (const npcId in NPCS) {
            const npcData = NPCS[npcId];
            if (npcData.area === this.currentAreaId) {
                // Use the real NPC spritesheet, or fall back to generated 'npc' texture
                const texture = NPC_TEXTURES[npcId] || 'npc';
                const npc = this.physics.add.sprite(
                    npcData.x * tileSize,
                    npcData.y * tileSize,
                    texture, 0
                ).setScale(1).setImmovable(true).setDepth(9);
                // Play idle animation if available
                if (NPC_ANIMS[npcId]) {
                    npc.anims.play(NPC_ANIMS[npcId]);
                }
                // Apply tint if defined
                if (NPC_TINTS[npcId]) {
                    npc.setTint(NPC_TINTS[npcId]);
                }

                this.physics.add.collider(this.player, npc);
                npc.npcId = npcId;
                npc.npcData = npcData;
                this.npcs.push(npc);
            }
        }
    }

    update(time, delta) {
        this.player.update();

        // Don't process combat if player is dead
        if (this.player.isDead) return;

        // --- PLAYER ATTACK (keyboard Space OR mobile touch button) ---
        const touchAttack = this.uiScene && this.uiScene.touchAttack;
        if (Phaser.Input.Keyboard.JustDown(this.attackKey) || touchAttack) {
            this.combatSystem.playerAttack(this.player, this.enemies);
            // Reset touch attack so it doesn't fire every frame
            if (this.uiScene) this.uiScene.touchAttack = false;
        }

        // --- NPC INTERACTION (press E or touch Talk button) ---
        if (this.dialogCooldown > 0) this.dialogCooldown -= delta;
        const touchTalk = this.uiScene && this.uiScene.touchTalk;
        if ((Phaser.Input.Keyboard.JustDown(this.interactKey) || touchTalk) && !this.dialogOpen && this.dialogCooldown <= 0) {
            this.tryTalkToNPC();
            if (this.uiScene) this.uiScene.touchTalk = false;
        }

        // --- UPDATE ENEMIES ---
        this.enemies.getChildren().forEach(enemy => {
            enemy.update(time, delta);
        });

        // Safety: if dialogOpen is stuck but no dialog scene is running, reset it
        if (this.dialogOpen && !this.scene.isActive('Dialog') && !this.scene.isActive('Shop') && !this.scene.isActive('Admin')) {
            this.dialogOpen = false;
        }
        // Same for inventoryOpen
        if (this.inventoryOpen && !this.scene.isActive('Inventory')) {
            this.inventoryOpen = false;
        }

        // --- CHECK POND TELEPORT (hidden entrance to Underwater City) ---
        this.checkPondTeleport();

        // --- UPDATE GUIDE ARROW & INTERACT PROMPT ---
        this.updateGuideArrow();

        // Send player data to the UIScene HUD
        if (this.uiScene && this.uiScene.updateHUD) {
            this.uiScene.updateHUD({
                hp: this.player.hp,
                maxHP: this.player.maxHP,
                level: this.player.level,
                xp: this.player.xp,
                gold: this.player.gold,
                areaName: this.currentArea.name,
                equippedWeapon: this.player.equippedWeapon,
                equippedArmor: this.player.equippedArmor
            });
        }
    }

    // --- "YOU DIED!" SCREEN ---
    // Shows a dark overlay with text and a Respawn button.
    showDeathScreen() {
        // Hide the HUD
        this.scene.setVisible(false, 'UI');

        // Dark overlay covering the whole camera view
        const overlay = this.add.rectangle(
            this.cameras.main.scrollX + 640,
            this.cameras.main.scrollY + 360,
            1280, 720, 0x000000, 0.8
        ).setDepth(50).setScrollFactor(0);

        // "YOU DIED!" text
        const diedText = this.add.text(640, 250, 'YOU DIED!', {
            fontSize: '32px',
            fontFamily: 'Nunito',
            fontStyle: 'bold',
            color: '#e94560',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

        // Pulsing animation on the text
        this.tweens.add({
            targets: diedText,
            alpha: { from: 0.7, to: 1 },
            scaleX: { from: 0.95, to: 1.05 },
            scaleY: { from: 0.95, to: 1.05 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Stats text
        const statsText = this.add.text(640, 320, `Level: ${this.player.level}  |  Gold: ${this.player.gold}`, {
            fontSize: '14px',
            fontFamily: 'Nunito',
            fontStyle: 'bold',
            color: '#aaaaaa'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

        // "RESPAWN" button
        const respawnBg = this.add.rectangle(640, 390, 240, 50, 0xe94560)
            .setDepth(51).setScrollFactor(0).setInteractive({ useHandCursor: true });
        const respawnText = this.add.text(640, 390, 'RESPAWN', {
            fontSize: '18px',
            fontFamily: 'Nunito',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(52);

        // Hover effect
        respawnBg.on('pointerover', () => {
            respawnBg.setFillStyle(0xff6b81);
        });
        respawnBg.on('pointerout', () => {
            respawnBg.setFillStyle(0xe94560);
        });

        // Click to respawn
        respawnBg.on('pointerdown', () => {
            // Remove ALL death screen elements
            overlay.destroy();
            diedText.destroy();
            statsText.destroy();
            respawnText.destroy();
            respawnBg.destroy();
            // Respawn the player
            this.player.respawn();
            // Show the HUD again
            this.scene.setVisible(true, 'UI');
            // Camera fade in
            this.cameras.main.fadeIn(500);
        });
    }


    // --- TREASURE CHEST ---
    openChest(chest) {
        if (chest.isOpened) return;
        chest.isOpened = true;
        chest.setTexture('chest-open');
        this.player.gold += chest.goldReward;

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const sparkle = this.add.rectangle(chest.x, chest.y, 3, 3, 0xffd700).setDepth(20);
            this.tweens.add({
                targets: sparkle,
                x: chest.x + Math.cos(angle) * 25,
                y: chest.y + Math.sin(angle) * 25 - 10,
                alpha: 0, duration: 500, ease: 'Power2',
                onComplete: () => sparkle.destroy()
            });
        }

        if (this.uiScene && this.uiScene.showFloatingText) {
            this.uiScene.showFloatingText(chest.x, chest.y - 15, '+' + chest.goldReward + ' Gold!', '#ffd700', 18, 1500);
        }
        this.cameras.main.shake(100, 0.005);
    }

    // --- GUIDE DATA (computed here, rendered in UIScene) ---
    updateGuideArrow() {
        const tileSize = 16;
        const promptRange = 45;

        // Reset guide state
        this.guideState = { type: 'none' };

        if (this.dialogOpen) return;

        // First: check if the player is near ANY NPC (quest giver, shop, or otherwise)
        // This shows "Press E" for ALL NPCs, not just quest givers
        let nearestNpc = null;
        let nearestDist = Infinity;
        for (const npcId in NPCS) {
            const npcData = NPCS[npcId];
            if (npcData.area !== this.currentAreaId) continue;
            const npcX = npcData.x * tileSize;
            const npcY = npcData.y * tileSize;
            const dist = distanceBetween(this.player.x, this.player.y, npcX, npcY);
            if (dist < promptRange && dist < nearestDist) {
                nearestDist = dist;
                nearestNpc = npcData;
            }
        }

        if (nearestNpc) {
            const npcX = nearestNpc.x * tileSize;
            const npcY = nearestNpc.y * tileSize;
            this.guideState = { type: 'prompt', worldX: npcX, worldY: npcY - 28 };
            return;
        }

        // Second: if no NPC is nearby and there's no active quest, show guide arrow
        const hasActiveQuest = this.questManager.getActiveQuest() !== null;
        if (hasActiveQuest) return;

        // Find the NPC that has an available quest to point toward
        for (const npcId in NPCS) {
            const npcData = NPCS[npcId];
            if (npcData.isShop) continue;
            const available = this.questManager.getAvailableQuests(npcId);
            if (available.length > 0) {
                let targetX, targetY;
                if (npcData.area === this.currentAreaId) {
                    targetX = npcData.x * tileSize;
                    targetY = npcData.y * tileSize;
                } else if (npcData.area === 'elder_house' && this.currentAreaId === 'area1' && this.elderDoor) {
                    // Point toward the elder's house door in area1
                    targetX = this.elderDoor.x + this.elderDoor.w / 2;
                    targetY = this.elderDoor.y + this.elderDoor.h / 2;
                } else {
                    continue; // NPC is in a different area we can't point to
                }
                const angle = Math.atan2(targetY - this.player.y, targetX - this.player.x);
                this.guideState = {
                    type: 'arrow',
                    worldX: this.player.x + Math.cos(angle) * 35,
                    worldY: this.player.y + Math.sin(angle) * 35,
                    angle: angle
                };
                return;
            }
        }
    }

    // --- NPC INTERACTION ---
    // Check if player is near an NPC and open dialog
    tryTalkToNPC() {
        const tileSize = 16;
        const interactRange = 40;

        for (const npcId in NPCS) {
            const npcData = NPCS[npcId];
            if (npcData.area !== this.currentAreaId) continue;

            const npcX = npcData.x * tileSize;
            const npcY = npcData.y * tileSize;
            const dist = distanceBetween(this.player.x, this.player.y, npcX, npcY);

            if (dist < interactRange) {
                this.openNPCDialog(npcId, npcData);
                return;
            }
        }
    }

    // Open dialog with an NPC
    openNPCDialog(npcId, npcData) {
        this.dialogOpen = true;
        this.player.setVelocity(0, 0);

        // If this NPC is a shop, open the shop scene instead of dialog
        if (npcData.isShop) {
            this.scene.launch('Shop', {
                player: this.player,
                shopType: npcData.shopType || 'weapons',
                npcName: npcData.name
            });
            return;
        }

        // Check if NPC has an available quest
        const availableQuests = this.questManager.getAvailableQuests(npcId);
        const activeQuests = this.questManager.getActiveQuests(npcId);

        if (availableQuests.length > 0) {
            // Offer the first available quest
            const questId = availableQuests[0];
            const quest = QUESTS[questId];

            this.scene.launch('Dialog', {
                npcId: npcId,
                npcName: npcData.name,
                dialogText: quest.dialog.intro,
                quest: quest,
                questId: questId,
                showAcceptDecline: true
            });
        } else if (activeQuests.length > 0) {
            // Show progress for the first active quest
            const questId = activeQuests[0];
            const progressText = this.questManager.getProgressText(questId);

            this.scene.launch('Dialog', {
                npcId: npcId,
                npcName: npcData.name,
                dialogText: progressText,
                showAcceptDecline: false
            });
        } else {
            // No quests — just a greeting
            this.scene.launch('Dialog', {
                npcId: npcId,
                npcName: npcData.name,
                dialogText: npcData.dialog.noQuest,
                showAcceptDecline: false
            });
        }
    }

    // --- QUEST-DRIVEN ENEMY SPAWNING ---
    // Called by QuestManager when a quest is accepted
    startQuestSpawning(questId) {
        // Don't spawn enemies inside the elder's house — save it for when we return
        if (this.currentAreaId === 'elder_house') {
            this.activeQuestId = questId;
            this._pendingQuestSpawn = questId;
            return;
        }

        const quest = QUESTS[questId];
        this.activeQuestId = questId;
        this.questDifficulty = quest.difficulty || 1;

        // collect_drops quests use dropFrom instead of target for spawning
        const spawnTarget = quest.type === 'collect_drops' ? quest.dropFrom : quest.target;

        // If quest has a boss target, spawn the boss first
        const targetData = ENEMIES[spawnTarget];
        if (targetData && targetData.isBoss) {
            this.spawnQuestEnemy(spawnTarget);

            if (quest.minions) {
                for (let i = 0; i < 3; i++) {
                    this.spawnQuestEnemy(quest.minions);
                }
            }

            this.spawnTimer = this.time.addEvent({
                delay: 5000,
                callback: () => {
                    const aliveCount = this.enemies.getChildren().length;
                    if (aliveCount < 5 && quest.minions) {
                        this.spawnQuestEnemy(quest.minions);
                    }
                },
                loop: true
            });
        } else {
            for (let i = 0; i < 3; i++) {
                this.spawnQuestEnemy(spawnTarget);
            }

            this.spawnTimer = this.time.addEvent({
                delay: 4000,
                callback: () => {
                    const aliveCount = this.enemies.getChildren().length;
                    if (aliveCount < 6) {
                        this.spawnQuestEnemy(spawnTarget);
                    }
                },
                loop: true
            });
        }
    }

    // --- COLLECT QUEST: spawn a glowing item drop at the enemy death spot ---
    spawnDropItem(questId, x, y) {
        const item = this.physics.add.sprite(x, y, 'quest-item').setDepth(10);
        item.questId = questId;

        // Pulse animation
        this.tweens.add({
            targets: item,
            scaleX: 1.4, scaleY: 1.4,
            alpha: 0.7,
            yoyo: true,
            repeat: -1,
            duration: 500
        });

        this.physics.add.overlap(this.player, item, () => {
            if (!item.active) return;
            item.destroy();
            this.questManager.onItemCollected(questId);
        });
    }

    // --- FIND HIDDEN: place pre-defined items on the map ---
    spawnHiddenItems(questId) {
        const quest = QUESTS[questId];
        const tileSize = 16;
        for (const pos of quest.hiddenItems) {
            const x = pos.tx * tileSize + tileSize / 2;
            const y = pos.ty * tileSize + tileSize / 2;
            const item = this.physics.add.sprite(x, y, 'quest-item').setDepth(10);
            item.questId = questId;

            // Slower golden pulse for hidden items
            this.tweens.add({
                targets: item,
                scaleX: 1.6, scaleY: 1.6,
                alpha: 0.5,
                yoyo: true,
                repeat: -1,
                duration: 800
            });

            this.physics.add.overlap(this.player, item, () => {
                if (!item.active) return;
                item.destroy();
                this.questManager.onItemCollected(questId);
            });
        }
    }

    // --- DELIVER QUEST: show a destination marker on the map ---
    spawnDeliverDestination(questId) {
        const quest = QUESTS[questId];
        const tileSize = 16;
        const x = quest.destination.tx * tileSize + tileSize / 2;
        const y = quest.destination.ty * tileSize + tileSize / 2;

        // Star-shaped marker (large glowing ring)
        this.deliverMarker = this.add.graphics().setDepth(10);
        this.deliverMarker.lineStyle(2, 0xffd700, 1);
        this.deliverMarker.strokeCircle(x, y, 14);
        this.deliverMarker.lineStyle(2, 0xffffff, 0.6);
        this.deliverMarker.strokeCircle(x, y, 8);

        // Label
        this.deliverLabel = this.add.text(x, y - 24, quest.destinationLabel, {
            fontSize: '7px', fontFamily: 'Nunito', fontStyle: 'bold',
            color: '#ffd700', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(11);

        // Pulse the marker
        this.tweens.add({
            targets: [this.deliverMarker, this.deliverLabel],
            alpha: 0.3,
            yoyo: true,
            repeat: -1,
            duration: 700
        });

        // Trigger zone — player walks into it
        const zone = this.add.zone(x, y, 32, 32);
        this.physics.world.enable(zone);
        this.deliverZone = zone;

        this.physics.add.overlap(this.player, zone, () => {
            if (!zone.active) return;
            zone.destroy();
            if (this.deliverMarker) { this.deliverMarker.destroy(); this.deliverMarker = null; }
            if (this.deliverLabel) { this.deliverLabel.destroy(); this.deliverLabel = null; }
            this.questManager.onDeliverReached(questId);
        });
    }

    // Spawn a single enemy at a random position far from the player
    spawnQuestEnemy(enemyType) {
        const tileSize = 16;
        const mapW = this.currentArea.width;
        const mapH = this.currentArea.height;
        let spawnX, spawnY;
        let attempts = 0;

        // Keep trying until we find a spot far enough from the player
        do {
            const tileX = Phaser.Math.Between(4, mapW - 4);
            const tileY = Phaser.Math.Between(4, mapH - 4);
            spawnX = tileX * tileSize;
            spawnY = tileY * tileSize;
            attempts++;
        } while (
            distanceBetween(spawnX, spawnY, this.player.x, this.player.y) < 200 &&
            attempts < 30
        );

        const diff = this.questDifficulty || 1;
        const enemy = new Enemy(this, spawnX, spawnY, enemyType, diff);
        enemy.target = this.player;
        this.enemies.add(enemy);

        // Set up collisions for this new enemy
        const layers = this.collisionLayers;
        this.physics.add.collider(enemy, layers.buildings);
    }

    // Called by QuestManager when quest is complete — stop spawning, kill all enemies
    stopQuestSpawning(questId) {
        this.activeQuestId = null;

        // Stop the spawn timer
        if (this.spawnTimer) {
            this.spawnTimer.remove();
            this.spawnTimer = null;
        }

        // Kill all remaining enemies with a poof effect (no rewards)
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.state !== 'DEAD') {
                enemy.state = 'DEAD';
                enemy.setVelocity(0, 0);
                enemy.body.enable = false;

                enemy.scene.tweens.add({
                    targets: enemy,
                    alpha: 0,
                    scaleX: 0,
                    scaleY: 0,
                    duration: 400,
                    onComplete: () => {
                        enemy.healthBar.destroy();
                        if (enemy.bossNameTag) enemy.bossNameTag.destroy();
                        enemy.destroy();
                    }
                });
            }
        });
    }

    // (placeCluster removed — no longer using tilemaps)

    // Check if player stepped into teleport zones
    checkPondTeleport() {
        if (this._teleporting) return;
        if (this.dialogOpen || this.inventoryOpen) return;

        const tileSize = 16;
        const px = Math.floor(this.player.x / tileSize);
        const py = Math.floor(this.player.y / tileSize);

        // Area 1: hidden pond in jungle teleports to Underwater City
        if (this.currentAreaId === 'area1') {
            // The hidden pond is now at tiles (68-75, 52-58) — deep in the jungle
            if (px >= 68 && px <= 75 && py >= 52 && py <= 58) {
                if (this.player.level < 3) {
                    if (!this._pondWarningShown) {
                        this._pondWarningShown = true;
                        if (this.uiScene && this.uiScene.showFloatingText) {
                            this.uiScene.showFloatingText(this.player.x, this.player.y - 20, 'Level 3 required!', '#e74c3c', 18, 1500);
                        }
                        this.time.delayedCall(1500, () => { this._pondWarningShown = false; });
                    }
                    return;
                }
                this.teleportToArea('area2');
            }

            // Elder's house door — walk into it to teleport (no key needed)
            if (this.elderDoor) {
                const door = this.elderDoor;
                const playerInDoor = (
                    this.player.x >= door.x && this.player.x <= door.x + door.w &&
                    this.player.y >= door.y && this.player.y <= door.y + door.h
                );
                if (playerInDoor) {
                    this.teleportToArea('elder_house');
                    return;
                }
            }

            // Area portals to other areas (area3-area10)
            if (this.areaPortals) {
                for (const p of this.areaPortals) {
                    if (px >= p.tx && px <= p.tx + p.tw - 1 && py >= p.ty && py <= p.ty + p.th - 1) {
                        if (this.player.level < p.level) {
                            if (!this._portalWarningShown) {
                                this._portalWarningShown = true;
                                if (this.uiScene && this.uiScene.showFloatingText) {
                                    this.uiScene.showFloatingText(this.player.x, this.player.y - 20, 'Level ' + p.level + ' required!', '#e74c3c', 18, 1500);
                                }
                                this.time.delayedCall(1500, () => { this._portalWarningShown = false; });
                            }
                            return;
                        }
                        this.teleportToArea(p.areaId);
                        return;
                    }
                }
            }
        }

        // Area 2: portal pool returns to area1
        if (this.currentAreaId === 'area2') {
            if (px >= 12 && px <= 17 && py >= 10 && py <= 13) {
                this.teleportToArea('area1');
            }
        }

        // Elder house: step on exit door to return to area1
        if (this.currentAreaId === 'elder_house') {
            if (px >= 6 && px <= 7 && py >= 10) {
                this.teleportToArea('area1');
            }
        }

        // Areas 3-10: only the marked portal zone teleports back
        if (/^area([3-9]|10)$/.test(this.currentAreaId) && this.returnPortalZone) {
            const zone = this.returnPortalZone;
            const zx1 = Math.floor(zone.x / tileSize);
            const zy1 = Math.floor(zone.y / tileSize);
            const zx2 = zx1 + Math.ceil(zone.w / tileSize);
            const zy2 = zy1 + Math.ceil(zone.h / tileSize);
            if (px >= zx1 && px <= zx2 && py >= zy1 && py <= zy2) {
                this.teleportToArea('area1');
                return;
            }
        }
    }

    teleportToArea(areaId) {
        if (this._teleporting) return;
        this._teleporting = true;

        this.player.setVelocity(0, 0);
        if (this.player.body) this.player.body.enable = false;
        if (this.spawnTimer) { this.spawnTimer.remove(); this.spawnTimer = null; }

        // Save player stats
        const playerStats = {
            level: this.player.level, xp: this.player.xp, gold: this.player.gold,
            maxHP: this.player.maxHP, hp: this.player.hp,
            moveSpeed: this.player.moveSpeed, attackPower: this.player.attackPower,
            defense: this.player.defense,
            equippedWeapon: this.player.equippedWeapon,
            equippedArmor: this.player.equippedArmor,
            inventory: this.player.inventory ? [...this.player.inventory] : [],
            potions: this.player.potions ? { ...this.player.potions } : {}
        };

        // Save quest states
        const questStates = this.questManager ? {
            states: { ...this.questManager.questStates },
            progress: { ...this.questManager.questProgress },
            killRewards: JSON.parse(JSON.stringify(this.questManager.questKillRewards))
        } : null;

        // Complete "visit brother" quest on arrival at area2
        if (areaId === 'area2' && questStates && questStates.states['q_visit_brother'] === 'active') {
            questStates.states['q_visit_brother'] = 'rewarded';
            playerStats.xp += QUESTS['q_visit_brother'].rewardXP;
            playerStats.gold += QUESTS['q_visit_brother'].rewardGold;
        }
        // Complete "return to elder" quest when entering elder's house
        if (areaId === 'elder_house' && questStates && questStates.states['q_sea_return'] === 'active') {
            questStates.states['q_sea_return'] = 'rewarded';
            playerStats.xp += QUESTS['q_sea_return'].rewardXP;
            playerStats.gold += QUESTS['q_sea_return'].rewardGold;
        }

        // When exiting elder's house, spawn outside the door
        let overrideSpawn = null;
        if (this.currentAreaId === 'elder_house' && areaId === 'area1') {
            overrideSpawn = { x: 9, y: 12 };
        }

        const launchData = { areaId, playerStats, questStates, overrideSpawn };

        const self = this;
        const doTransition = () => {
            self.scene.stop('UI');
            self.scene.start('Game', launchData);
        };

        // Elder house: use native setTimeout (Phaser timers can fail on tiny scenes)
        if (this.currentAreaId === 'elder_house' || areaId === 'elder_house') {
            setTimeout(doTransition, 50);
        } else {
            let fadeColor = (areaId === 'area2') ? [0, 0, 80] : [0, 50, 0];
            this.cameras.main.fadeOut(600, ...fadeColor);
            this.cameras.main.once('camerafadeoutcomplete', doTransition);
        }
    }
}
