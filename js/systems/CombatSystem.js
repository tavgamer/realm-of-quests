// Realm of Quests - Combat System
//
// This system handles all combat interactions:
// - Player attacking enemies (pressing Space creates a hitbox)
// - Damage calculation
// - Knockback (pushing enemies away when hit)
// - Invincibility frames (brief protection after getting hit)
//
// NEW CONCEPT: Hitbox
// A hitbox is an invisible rectangle that checks for overlaps.
// When you press Space, we create a small hitbox in front of the player.
// Any enemy touching that hitbox takes damage. The hitbox only lasts
// for a split second (one "swing" of the sword).

class CombatSystem {
    constructor(scene) {
        this.scene = scene;

        // Create a physics group for attack hitboxes
        // These are invisible sprites that detect overlaps with enemies
        this.attackHitboxes = scene.physics.add.group();
    }

    // Called when the player presses the attack button (Space)
    playerAttack(player, enemies) {
        if (player.isAttacking) return; // Already mid-swing

        player.isAttacking = true;

        // Get the weapon's damage
        const weaponData = WEAPONS[player.equippedWeapon];
        const totalDamage = player.attackPower + weaponData.damage;

        // Create a hitbox in front of the player based on facing direction
        let hbX = player.x;
        let hbY = player.y;
        const hitboxSize = 20;

        switch (player.facing) {
            case 'up':    hbY -= 24; break;
            case 'down':  hbY += 24; break;
            case 'left':  hbX -= 24; break;
            case 'right': hbX += 24; break;
        }

        // Create the attack hitbox (a small invisible sprite)
        const hitbox = this.scene.add.rectangle(hbX, hbY, hitboxSize, hitboxSize);
        this.scene.physics.add.existing(hitbox);
        hitbox.body.setAllowGravity(false);

        // Visual feedback: a quick slash effect (color matches weapon!)
        this.showSlashEffect(hbX, hbY, player.facing, player);

        // Check what enemies the hitbox overlaps with
        enemies.getChildren().forEach(enemy => {
            if (enemy.state === 'DEAD') return;

            const dist = Phaser.Math.Distance.Between(hbX, hbY, enemy.x, enemy.y);
            if (dist < hitboxSize + 12) {
                // HIT! Deal damage to this enemy
                enemy.takeDamage(totalDamage);

                // Knockback: push the enemy away from the player
                this.applyKnockback(player, enemy, 150);
            }
        });

        // Remove the hitbox after a brief moment
        this.scene.time.delayedCall(100, () => {
            hitbox.destroy();
        });

        // Attack cooldown — 1 second between attacks so combat feels deliberate
        const cooldown = 1000;
        this.scene.time.delayedCall(cooldown, () => {
            player.isAttacking = false;
        });
    }

    // Push an entity away from the attacker
    applyKnockback(attacker, target, force) {
        const angle = Phaser.Math.Angle.Between(
            attacker.x, attacker.y, target.x, target.y
        );
        target.setVelocity(
            Math.cos(angle) * force,
            Math.sin(angle) * force
        );

        // Stop the knockback velocity after a short time
        this.scene.time.delayedCall(150, () => {
            if (target.body) {
                target.setVelocity(0, 0);
            }
        });
    }

    // Show weapon swing + slash arc + special effects per weapon
    showSlashEffect(x, y, direction, player) {
        const weaponId = player ? player.equippedWeapon : 'wooden_sword';
        const weaponData = WEAPONS[weaponId];
        const bladeColor = weaponData ? weaponData.color : 0xc0c0c0;

        // --- DRAW THE WEAPON (unique shape per weapon) ---
        const sword = this.scene.add.graphics().setDepth(15);

        let swordAngle = 0;
        let swingAmount = 90;
        switch (direction) {
            case 'down':  swordAngle = -45;  break;
            case 'up':    swordAngle = 135;  break;
            case 'left':  swordAngle = 45;   break;
            case 'right': swordAngle = -135; break;
        }

        this.drawWeaponShape(sword, weaponId, bladeColor);
        sword.setPosition(x, y);
        sword.setAngle(swordAngle);

        this.scene.tweens.add({
            targets: sword,
            angle: swordAngle + swingAmount,
            duration: 200,
            ease: 'Power2',
            onComplete: () => sword.destroy()
        });

        // --- SLASH ARC ---
        const slash = this.scene.add.graphics().setDepth(14);
        let startAngle, endAngle;
        switch (direction) {
            case 'up':    startAngle = -150; endAngle = -30; break;
            case 'down':  startAngle = 30; endAngle = 150; break;
            case 'left':  startAngle = -240; endAngle = -120; break;
            case 'right': startAngle = -60; endAngle = 60; break;
        }

        slash.lineStyle(3, 0xffffff, 0.9);
        slash.beginPath();
        slash.arc(x, y, 16, Phaser.Math.DegToRad(startAngle), Phaser.Math.DegToRad(endAngle), false);
        slash.strokePath();

        slash.lineStyle(2, bladeColor, 0.7);
        slash.beginPath();
        slash.arc(x, y, 12, Phaser.Math.DegToRad(startAngle), Phaser.Math.DegToRad(endAngle), false);
        slash.strokePath();

        this.scene.tweens.add({
            targets: slash, alpha: 0, duration: 250,
            onComplete: () => slash.destroy()
        });

        // --- SPECIAL EFFECTS for high-tier weapons ---
        this.spawnWeaponParticles(x, y, weaponId, bladeColor);
    }

    // Draw unique weapon shape per weapon type
    drawWeaponShape(gfx, weaponId, color) {
        switch (weaponId) {
            case 'wooden_sword':
                // Simple wooden sword — short, thick, brown
                gfx.fillStyle(0x5d4037, 1);
                gfx.fillRect(-2, -2, 4, 7);     // Handle
                gfx.fillStyle(0x8d6e63, 1);
                gfx.fillRect(-3, 4, 6, 2);       // Guard
                gfx.fillStyle(color, 1);
                gfx.fillRect(-2, -12, 4, 10);    // Blade (wide, short)
                gfx.fillStyle(0xffffff, 0.3);
                gfx.fillRect(-1, -13, 2, 3);     // Tip
                break;

            case 'iron_sword':
                // Classic sword — longer, proper shape
                gfx.fillStyle(0x5d4037, 1);
                gfx.fillRect(-2, -1, 4, 6);      // Handle
                gfx.fillStyle(0xaaaaaa, 1);
                gfx.fillRect(-4, 4, 8, 2);       // Guard
                gfx.fillStyle(color, 1);
                gfx.fillRect(-1, -15, 3, 14);    // Blade
                gfx.fillStyle(0xffffff, 0.4);
                gfx.fillRect(0, -15, 1, 14);     // Shine line
                gfx.fillRect(-1, -17, 3, 2);     // Pointed tip
                break;

            case 'steel_sword':
                // Broader, shinier blade
                gfx.fillStyle(0x37474f, 1);
                gfx.fillRect(-2, -1, 4, 6);      // Handle
                gfx.fillStyle(0x78909c, 1);
                gfx.fillRect(-5, 4, 10, 2);      // Wide guard
                gfx.fillStyle(color, 1);
                gfx.fillRect(-2, -16, 4, 15);    // Wide blade
                gfx.fillStyle(0xffffff, 0.5);
                gfx.fillRect(-1, -16, 1, 15);    // Shine
                gfx.fillRect(0, -18, 1, 3);      // Sharp tip
                break;

            case 'magic_staff':
                // Long thin staff with a glowing orb on top
                gfx.fillStyle(0x5d4037, 1);
                gfx.fillRect(-1, -2, 2, 10);     // Shaft
                gfx.fillStyle(0x8d6e63, 1);
                gfx.fillRect(-2, 6, 4, 2);       // Base
                gfx.fillStyle(color, 1);
                gfx.fillRect(-1, -18, 2, 16);    // Staff
                // Orb at top
                gfx.fillStyle(color, 1);
                gfx.fillCircle(0, -20, 4);
                gfx.fillStyle(0xffffff, 0.6);
                gfx.fillCircle(-1, -21, 2);      // Orb shine
                break;

            case 'shadow_dagger':
                // Short, thin, fast dagger
                gfx.fillStyle(0x1a1a2e, 1);
                gfx.fillRect(-1, 0, 2, 5);       // Handle (dark)
                gfx.fillStyle(0x34495e, 1);
                gfx.fillRect(-3, 4, 6, 1);       // Small guard
                gfx.fillStyle(color, 1);
                gfx.fillRect(-1, -10, 2, 10);    // Short blade
                gfx.fillStyle(0xffffff, 0.3);
                gfx.fillRect(0, -10, 1, 8);      // Shine
                // Jagged tip
                gfx.fillStyle(color, 1);
                gfx.fillRect(0, -12, 1, 2);
                break;

            case 'fire_blade':
                // Wavy flame-shaped blade
                gfx.fillStyle(0x5d4037, 1);
                gfx.fillRect(-2, -1, 4, 6);      // Handle
                gfx.fillStyle(0xff6600, 1);
                gfx.fillRect(-4, 4, 8, 2);       // Orange guard
                // Flame blade — wavy shape
                gfx.fillStyle(color, 1);
                gfx.fillRect(-2, -16, 4, 15);    // Base blade
                gfx.fillStyle(0xff6600, 0.8);
                gfx.fillRect(-3, -12, 1, 4);     // Left wave
                gfx.fillRect(3, -8, 1, 4);       // Right wave
                gfx.fillStyle(0xffff00, 0.6);
                gfx.fillRect(-1, -18, 2, 3);     // Flame tip
                gfx.fillRect(0, -20, 1, 2);      // Extra flame
                break;

            case 'holy_sword':
                // Grand golden sword with cross guard
                gfx.fillStyle(0x8d6e63, 1);
                gfx.fillRect(-2, -1, 4, 6);      // Handle
                gfx.fillStyle(0xf1c40f, 1);
                gfx.fillRect(-2, 5, 4, 2);       // Pommel
                // Wide cross guard
                gfx.fillStyle(color, 1);
                gfx.fillRect(-6, 3, 12, 3);
                // Broad golden blade
                gfx.fillStyle(color, 1);
                gfx.fillRect(-2, -18, 5, 17);
                // Center shine
                gfx.fillStyle(0xffffff, 0.5);
                gfx.fillRect(0, -18, 1, 17);
                // Diamond tip
                gfx.fillStyle(0xffffff, 0.7);
                gfx.fillRect(-1, -20, 3, 2);
                gfx.fillRect(0, -22, 1, 2);
                break;

            default:
                // Fallback basic sword
                gfx.fillStyle(0x8B4513, 1);
                gfx.fillRect(-2, -2, 4, 6);
                gfx.fillStyle(0xf1c40f, 1);
                gfx.fillRect(-4, 4, 8, 2);
                gfx.fillStyle(color, 1);
                gfx.fillRect(-1, -14, 3, 12);
                break;
        }
    }

    // Spawn special particles for high-tier weapons
    spawnWeaponParticles(x, y, weaponId, color) {
        if (weaponId === 'fire_blade') {
            // Fire sparks flying outward
            for (let i = 0; i < 6; i++) {
                const spark = this.scene.add.circle(
                    x + Phaser.Math.Between(-8, 8),
                    y + Phaser.Math.Between(-8, 8),
                    Phaser.Math.Between(1, 3),
                    Phaser.Math.RND.pick([0xe74c3c, 0xff6600, 0xffff00]), 1
                ).setDepth(16);
                this.scene.tweens.add({
                    targets: spark,
                    x: spark.x + Phaser.Math.Between(-20, 20),
                    y: spark.y + Phaser.Math.Between(-25, -5),
                    alpha: 0, scaleX: 0, scaleY: 0,
                    duration: Phaser.Math.Between(300, 500),
                    onComplete: () => spark.destroy()
                });
            }
        } else if (weaponId === 'holy_sword') {
            // Golden light burst
            const flash = this.scene.add.circle(x, y, 3, 0xffd700, 0.8).setDepth(16);
            this.scene.tweens.add({
                targets: flash,
                scaleX: 5, scaleY: 5, alpha: 0,
                duration: 350,
                onComplete: () => flash.destroy()
            });
            // Gold sparkles
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                const sparkle = this.scene.add.rectangle(
                    x, y, 2, 2, 0xffd700
                ).setDepth(16);
                this.scene.tweens.add({
                    targets: sparkle,
                    x: x + Math.cos(angle) * 18,
                    y: y + Math.sin(angle) * 18,
                    alpha: 0,
                    duration: 400,
                    onComplete: () => sparkle.destroy()
                });
            }
        } else if (weaponId === 'magic_staff') {
            // Purple magic orbs
            for (let i = 0; i < 4; i++) {
                const orb = this.scene.add.circle(
                    x + Phaser.Math.Between(-6, 6),
                    y + Phaser.Math.Between(-6, 6),
                    Phaser.Math.Between(2, 4), 0x9b59b6, 0.7
                ).setDepth(16);
                this.scene.tweens.add({
                    targets: orb,
                    x: orb.x + Phaser.Math.Between(-15, 15),
                    y: orb.y + Phaser.Math.Between(-15, 15),
                    alpha: 0, scaleX: 2, scaleY: 2,
                    duration: 400,
                    onComplete: () => orb.destroy()
                });
            }
        } else if (weaponId === 'shadow_dagger') {
            // Dark smoke wisps
            for (let i = 0; i < 3; i++) {
                const wisp = this.scene.add.circle(
                    x + Phaser.Math.Between(-5, 5),
                    y + Phaser.Math.Between(-5, 5),
                    Phaser.Math.Between(2, 5), 0x2c3e50, 0.5
                ).setDepth(16);
                this.scene.tweens.add({
                    targets: wisp,
                    y: wisp.y - 15, alpha: 0, scaleX: 2, scaleY: 2,
                    duration: 500,
                    onComplete: () => wisp.destroy()
                });
            }
        } else if (weaponId === 'steel_sword') {
            // Metallic sparks
            for (let i = 0; i < 3; i++) {
                const spark = this.scene.add.rectangle(
                    x + Phaser.Math.Between(-8, 8),
                    y + Phaser.Math.Between(-8, 8),
                    1, 1, 0xffffff, 1
                ).setDepth(16);
                this.scene.tweens.add({
                    targets: spark,
                    x: spark.x + Phaser.Math.Between(-12, 12),
                    y: spark.y + Phaser.Math.Between(-12, 12),
                    alpha: 0,
                    duration: 250,
                    onComplete: () => spark.destroy()
                });
            }
        }
        // wooden_sword and iron_sword: no special particles (basic weapons)
    }
}
