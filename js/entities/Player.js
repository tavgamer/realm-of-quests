// Realm of Quests - Player Entity
//
// This is the player character class. It extends Phaser.Physics.Arcade.Sprite,
// which means it's a sprite (image on screen) that has physics (can move, collide).
//
// NEW CONCEPTS:
// - "class extends" = this class inherits everything from Arcade.Sprite,
//   plus we add our own custom behavior (movement, stats, etc.)
// - "this" = refers to THIS specific player object
// - "scene" = the Phaser scene this player belongs to
// - "velocity" = how fast something moves in a direction (physics concept)

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Call the parent class constructor (creates the sprite)
        // 'player-sheet' is the spritesheet we loaded in BootScene.
        // Phaser will display frame 0 (first frame) by default.
        super(scene, x, y, 'player-sheet', 0);

        // Add this sprite to the scene so it appears on screen
        scene.add.existing(this);

        // Add physics to this sprite so it can move and collide
        scene.physics.add.existing(this);

        // The sprite is now 32x32 (real pixel art!). We scale it up a bit
        // so it looks good on the zoomed-in camera. 1.0 = original size.
        this.setScale(1);

        // Set up the physics body (the invisible collision box)
        // We make the hitbox smaller than the sprite so collisions feel fair.
        // setOffset moves the hitbox to be centered on the character's feet.
        this.body.setSize(16, 16);     // Hitbox size (smaller than the 32x32 sprite)
        this.body.setOffset(8, 14);    // Push hitbox down to align with feet
        this.setCollideWorldBounds(true);  // Can't walk off the edge of the map

        // --- PLAYER STATS ---
        this.level = 1;
        this.xp = 0;
        this.gold = 0;
        this.maxHP = LEVEL_CURVE[1].maxHP;
        this.hp = this.maxHP;
        this.moveSpeed = LEVEL_CURVE[1].speed;
        this.attackPower = LEVEL_CURVE[1].attack;
        this.defense = 0;

        // Which direction is the player facing? (used for attacks later)
        this.facing = 'down';

        // Equipment & Inventory
        // The inventory holds all items the player owns (weapon and armor IDs).
        // equippedWeapon/equippedArmor point to which ones are active.
        this.equippedWeapon = 'wooden_sword';
        this.equippedArmor = 'cloth_armor';
        this.inventory = ['wooden_sword', 'cloth_armor'];

        // Potions — stored as counts (can carry multiple of each)
        this.potions = {
            health_potion: 0,
            damage_potion: 0,
            xp_potion: 0,
            mega_health: 0
        };

        // --- COMBAT STATE ---
        this.isAttacking = false;       // True during attack animation
        this.invincible = false;        // True during invincibility frames after getting hit
        this.invincibleTimer = 0;       // How long invincibility lasts

        // Store reference to the scene (we'll need it for various things)
        this.scene = scene;

        // Set up keyboard controls
        // createCursorKeys() gives us arrow keys (up, down, left, right)
        this.cursors = scene.input.keyboard.createCursorKeys();

        // addKeys() lets us add WASD as additional movement keys
        this.wasd = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Depth sorting: make sure the player renders on top of ground tiles
        this.setDepth(10);

        // Armor overlay — a small graphic drawn over the body, NOT the face.
        // This sits on the same depth as the player, following them each frame.
        this.armorOverlay = scene.add.graphics().setDepth(11);
        this._lastArmorId = null;
    }

    update() {
        // Don't do anything if dead
        if (this.isDead) return;

        // Don't move during dialog, map, or inventory
        const uiScene = this.scene.scene.get('UI');
        if (this.scene.dialogOpen || this.scene.inventoryOpen || (uiScene && uiScene.mapOpen)) {
            this.setVelocity(0, 0);
            return;
        }

        // This runs every frame (60 times per second).
        // We check which keys are pressed and move accordingly.

        // Start with no movement
        let velocityX = 0;
        let velocityY = 0;

        // Read touch input from the UIScene (mobile controls)
        const touchX = uiScene && uiScene.touchDirection ? uiScene.touchDirection.x : 0;
        const touchY = uiScene && uiScene.touchDirection ? uiScene.touchDirection.y : 0;

        // Check horizontal movement (keyboard OR joystick)
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            velocityX = -this.moveSpeed;
            this.facing = 'left';
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            velocityX = this.moveSpeed;
            this.facing = 'right';
        }

        // Check vertical movement (keyboard OR joystick)
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            velocityY = -this.moveSpeed;
            this.facing = 'up';
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            velocityY = this.moveSpeed;
            this.facing = 'down';
        }

        // Apply joystick input (analog — values between -1 and 1)
        if (touchX !== 0 || touchY !== 0) {
            velocityX = touchX * this.moveSpeed;
            velocityY = touchY * this.moveSpeed;
            // Set facing based on strongest direction
            if (Math.abs(touchX) > Math.abs(touchY)) {
                this.facing = touchX < 0 ? 'left' : 'right';
            } else {
                this.facing = touchY < 0 ? 'up' : 'down';
            }
        }

        // If moving diagonally with keyboard, normalize speed
        if ((this.cursors.left.isDown || this.wasd.left.isDown || this.cursors.right.isDown || this.wasd.right.isDown) &&
            (this.cursors.up.isDown || this.wasd.up.isDown || this.cursors.down.isDown || this.wasd.down.isDown)) {
            velocityX *= 0.707;
            velocityY *= 0.707;
        }

        // Apply the velocity to actually move the player
        this.setVelocity(velocityX, velocityY);

        // --- PLAY THE RIGHT ANIMATION BASED ON MOVEMENT ---
        // When moving, play the walk animation for the direction we're facing.
        // When standing still, play the idle animation (single frame, no movement).
        //
        // HOW anims.play() WORKS:
        // The second argument 'true' means "if this animation is already playing,
        // don't restart it". Without this, the animation would reset every frame!
        if (velocityX !== 0 || velocityY !== 0) {
            this.anims.play('player-walk-' + this.facing, true);
        } else {
            this.anims.play('player-idle-' + this.facing, true);
        }

        // --- ARMOR OVERLAY ---
        // Draw colored armor on the body, NOT the face.
        // Helmet = top of head, Chest = torso, Legs = bottom.
        // Cloth armor = no overlay (default outfit).
        this.clearTint(); // Never full-body tint
        if (this.armorOverlay) {
            this.armorOverlay.clear();
            if (this.equippedArmor !== 'cloth_armor') {
                const armorData = ARMOR[this.equippedArmor];
                if (armorData) {
                    const ax = this.x;
                    const ay = this.y;
                    const c = armorData.color;
                    // Helmet (top of head, small strip — NOT the face)
                    this.armorOverlay.fillStyle(c, 0.6);
                    this.armorOverlay.fillRect(ax - 5, ay - 14, 10, 4);
                    // Chest / shirt area
                    this.armorOverlay.fillStyle(c, 0.5);
                    this.armorOverlay.fillRect(ax - 6, ay - 4, 12, 8);
                    // Legs / pants
                    this.armorOverlay.fillStyle(c, 0.35);
                    this.armorOverlay.fillRect(ax - 4, ay + 4, 8, 5);
                    // Shoulder pads for heavy armor
                    if (armorData.defense >= 10) {
                        this.armorOverlay.fillStyle(c, 0.7);
                        this.armorOverlay.fillRect(ax - 8, ay - 5, 4, 4);
                        this.armorOverlay.fillRect(ax + 4, ay - 5, 4, 4);
                    }
                }
            }
            // Hide overlay during invincibility flash
            if (this.invincible) {
                this.armorOverlay.setAlpha(Math.sin(Date.now() * 0.015) > 0 ? 0.3 : 1);
            } else {
                this.armorOverlay.setAlpha(1);
            }
        }

        // --- CHECK FOR LEVEL UP ---
        this.checkLevelUp();

        // --- INVINCIBILITY FLASH ---
        // After getting hit, the player flashes for a short time to show
        // they can't be hurt again yet (invincibility frames / "i-frames").
        if (this.invincible) {
            this.invincibleTimer -= 16; // ~16ms per frame at 60fps
            this.setAlpha(Math.sin(Date.now() * 0.015) > 0 ? 0.3 : 1);
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
                this.setAlpha(1);
            }
        }
    }

    // --- LEVEL UP ---
    // Checks if the player has enough XP to level up.
    // If so, increases level and all stats from LEVEL_CURVE.
    checkLevelUp() {
        if (this.level >= MAX_LEVEL) return;

        const nextLevel = this.level + 1;
        const nextLevelData = LEVEL_CURVE[nextLevel];

        if (this.xp >= nextLevelData.xpNeeded) {
            this.level = nextLevel;
            this.maxHP = nextLevelData.maxHP;
            this.hp = this.maxHP; // Full heal on level up!
            this.moveSpeed = nextLevelData.speed;
            this.attackPower = nextLevelData.attack;

            // Show level up effect
            this.showLevelUpEffect();

            // Check again in case we jumped multiple levels
            this.checkLevelUp();
        }
    }

    showLevelUpEffect() {
        // Flash golden
        this.setTintFill(0xffd700);
        this.scene.time.delayedCall(200, () => this.clearTint());

        // Camera flash
        this.scene.cameras.main.flash(300, 255, 215, 0);

        // Big "LEVEL UP!" text via UIScene
        const uiScene = this.scene.scene.get('UI');
        if (uiScene && uiScene.showFloatingText) {
            uiScene.showFloatingText(this.x, this.y - 30, 'LEVEL UP!', '#ffd700', 24, 1800);
        }

        // Burst particles around player
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const particle = this.scene.add.rectangle(
                this.x, this.y, 3, 3, 0xffd700
            ).setDepth(20);

            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * 40,
                y: this.y + Math.sin(angle) * 40,
                alpha: 0,
                duration: 600,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }

    // --- TAKE DAMAGE ---
    // Called when an enemy attacks the player.
    // The player's armor reduces incoming damage.
    takeDamage(amount) {
        if (this.invincible) return; // Can't be hurt during i-frames

        // Calculate damage after armor
        const armorData = ARMOR[this.equippedArmor];
        const armorDefense = armorData ? armorData.defense : 0;
        const damage = Math.max(1, amount - armorDefense - this.defense);

        this.hp -= damage;

        // Show damage number floating up
        const uiScene = this.scene.scene.get('UI');
        if (uiScene && uiScene.showFloatingText) {
            uiScene.showFloatingText(this.x, this.y - 10, '-' + damage, '#ff0000', 18, 800);
        }

        // Start invincibility frames (500ms of protection)
        this.invincible = true;
        this.invincibleTimer = 500;

        // Screen shake for impact feel!
        this.scene.cameras.main.shake(100, 0.01);

        // Check for death
        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }

    // --- DEATH ---
    die() {
        this.isDead = true;
        this.setVelocity(0, 0);
        this.body.enable = false;
        // Hide armor overlay during death
        if (this.armorOverlay) this.armorOverlay.clear();

        // Big screen shake
        this.scene.cameras.main.shake(300, 0.02);

        // Red flash on camera
        this.scene.cameras.main.flash(500, 255, 0, 0);

        // Death spin + shrink effect
        this.scene.tweens.add({
            targets: this,
            angle: 720,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                // Show "You Died" screen after the animation
                this.scene.showDeathScreen();
            }
        });
    }

    // Called by GameScene to respawn after the death screen
    respawn() {
        this.isDead = false;
        this.hp = this.maxHP;
        this.x = this.scene.currentArea.playerSpawn.x * 16;
        this.y = this.scene.currentArea.playerSpawn.y * 16;
        this.setScale(1);
        this.setAngle(0);
        this.setAlpha(1);
        this.body.enable = true;
        this.invincible = true;
        this.invincibleTimer = 1500; // Extra long i-frames after respawn
    }
}
