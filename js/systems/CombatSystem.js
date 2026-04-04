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

        // Visual feedback: a quick slash effect
        this.showSlashEffect(hbX, hbY, player.facing);

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

    // Show a sword swing + slash arc effect
    showSlashEffect(x, y, direction) {
        // --- SWORD ---
        // Draw a small pixel sword that appears in the player's hand
        const sword = this.scene.add.graphics();
        sword.setDepth(15);

        // Sword position and rotation based on direction
        let swordX = x, swordY = y;
        let swordAngle = 0;      // Starting angle for the swing
        let swingAmount = 90;     // How far the sword swings (degrees)

        switch (direction) {
            case 'down':
                swordAngle = -45;
                break;
            case 'up':
                swordAngle = 135;
                break;
            case 'left':
                swordAngle = 45;
                break;
            case 'right':
                swordAngle = -135;
                break;
        }

        // Draw sword shape (blade + handle)
        // Handle (brown)
        sword.fillStyle(0x8B4513, 1);
        sword.fillRect(-2, -2, 4, 6);
        // Guard (gold)
        sword.fillStyle(0xf1c40f, 1);
        sword.fillRect(-4, 4, 8, 2);
        // Blade (silver)
        sword.fillStyle(0xc0c0c0, 1);
        sword.fillRect(-1, -14, 3, 12);
        // Blade tip
        sword.fillStyle(0xe0e0e0, 1);
        sword.fillRect(0, -16, 1, 3);

        sword.setPosition(swordX, swordY);
        sword.setAngle(swordAngle);

        // Swing animation — rotate the sword through the arc
        this.scene.tweens.add({
            targets: sword,
            angle: swordAngle + swingAmount,
            duration: 200,
            ease: 'Power2',
            onComplete: () => sword.destroy()
        });

        // --- SLASH ARC ---
        const slash = this.scene.add.graphics();
        slash.setDepth(14);

        let startAngle, endAngle;
        switch (direction) {
            case 'up':    startAngle = -150; endAngle = -30; break;
            case 'down':  startAngle = 30; endAngle = 150; break;
            case 'left':  startAngle = -240; endAngle = -120; break;
            case 'right': startAngle = -60; endAngle = 60; break;
        }

        // White outer arc
        slash.lineStyle(3, 0xffffff, 0.9);
        slash.beginPath();
        slash.arc(x, y, 16, Phaser.Math.DegToRad(startAngle),
                  Phaser.Math.DegToRad(endAngle), false);
        slash.strokePath();

        // Red inner arc
        slash.lineStyle(2, 0xe94560, 0.7);
        slash.beginPath();
        slash.arc(x, y, 12, Phaser.Math.DegToRad(startAngle),
                  Phaser.Math.DegToRad(endAngle), false);
        slash.strokePath();

        // Fade out
        this.scene.tweens.add({
            targets: slash,
            alpha: 0,
            duration: 250,
            onComplete: () => slash.destroy()
        });
    }
}
