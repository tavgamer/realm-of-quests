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

        // Equipment
        this.equippedWeapon = 'wooden_sword';
        this.equippedArmor = 'cloth_armor';

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
    }

    update() {
        // Don't do anything if dead
        if (this.isDead) return;

        // This runs every frame (60 times per second).
        // We check which keys are pressed and move accordingly.

        // Start with no movement
        let velocityX = 0;
        let velocityY = 0;

        // Read touch input from the UIScene (mobile controls)
        const uiScene = this.scene.scene.get('UI');
        const touchX = uiScene && uiScene.touchDirection ? uiScene.touchDirection.x : 0;
        const touchY = uiScene && uiScene.touchDirection ? uiScene.touchDirection.y : 0;

        // Check horizontal movement (keyboard OR touch)
        if (this.cursors.left.isDown || this.wasd.left.isDown || touchX < 0) {
            velocityX = -this.moveSpeed;
            this.facing = 'left';
        } else if (this.cursors.right.isDown || this.wasd.right.isDown || touchX > 0) {
            velocityX = this.moveSpeed;
            this.facing = 'right';
        }

        // Check vertical movement (keyboard OR touch)
        if (this.cursors.up.isDown || this.wasd.up.isDown || touchY < 0) {
            velocityY = -this.moveSpeed;
            this.facing = 'up';
        } else if (this.cursors.down.isDown || this.wasd.down.isDown || touchY > 0) {
            velocityY = this.moveSpeed;
            this.facing = 'down';
        }

        // If moving diagonally, normalize the speed so you don't go faster
        // (Without this, moving diagonally would be ~1.4x faster than straight!)
        if (velocityX !== 0 && velocityY !== 0) {
            velocityX *= 0.707;  // 1/sqrt(2) ≈ 0.707
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
        const dmgText = this.scene.add.text(this.x, this.y - 10, '-' + damage, {
            fontSize: '8px',
            fontFamily: 'Press Start 2P',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(20);

        this.scene.tweens.add({
            targets: dmgText,
            y: dmgText.y - 20,
            alpha: 0,
            duration: 800,
            onComplete: () => dmgText.destroy()
        });

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
