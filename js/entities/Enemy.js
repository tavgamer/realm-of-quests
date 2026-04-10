// Realm of Quests - Enemy Entity
//
// Enemies roam the world, chase the player when they get close, and attack.
// Each enemy has an AI "state machine" — a set of behaviors it switches between:
//   IDLE    → standing still, waiting
//   PATROL  → walking back and forth between two points
//   CHASE   → spotted the player! Running toward them
//   ATTACK  → close enough to hit the player
//   HURT    → just got hit, briefly stunned
//   DEAD    → dying animation, then removed
//
// NEW CONCEPT: State Machine
// A state machine is like a flowchart. The enemy is always in ONE state,
// and certain conditions cause it to switch to another state.
// Example: if player gets close → switch from PATROL to CHASE.

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type, difficultyMult) {
        // Boss enemies can use a different sprite via spriteKey
        const data = ENEMIES[type];
        const spriteType = data.spriteKey || type;
        const textureKey = 'enemy-' + spriteType;
        super(scene, x, y, textureKey, 1);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Store the enemy type and its data from the config
        this.enemyType = type;
        this.enemyData = data;

        // Difficulty multiplier (later quests have stronger enemies)
        const mult = difficultyMult || 1;

        // --- STATS (scaled by difficulty) ---
        this.hp = Math.round(data.hp * mult);
        this.maxHP = this.hp;
        this.attackPower = Math.round(data.attack * mult);
        this.defensePower = Math.round(data.defense * mult);
        this.moveSpeed = data.speed;
        this.detectionRange = data.detectionRange;

        // --- PHYSICS ---
        const enemyScale = data.scale || 1;
        this.setScale(enemyScale);
        this.body.setSize(18, 18);
        this.body.setOffset(7, 12);
        this.setDepth(data.isBoss ? 9 : 8);

        // --- ENEMY VISUALS ---
        this.isBoss = data.isBoss || false;
        if (data.color) {
            // Apply tint when defined — bosses use their color, and some
            // regular enemies share a sprite but are tinted to look distinct
            this.setTint(data.color);
        }

        // --- AI STATE ---
        this.state = 'PATROL';
        this.stateTimer = 0;

        this.patrolTargetX = x + Phaser.Math.Between(-60, 60);
        this.patrolTargetY = y + Phaser.Math.Between(-60, 60);
        this.patrolWaitTime = 0;

        this.attackCooldown = 0;
        this.attackRate = this.isBoss ? 800 : 1000;  // Boss attacks faster

        this.hurtTimer = 0;
        this.target = null;

        // --- HEALTH BAR ---
        this.healthBar = scene.add.graphics();
        this.healthBar.setDepth(12);

        // --- BOSS NAME TAG ---
        if (this.isBoss) {
            this.bossNameTag = scene.add.text(x, y - 30, data.name, {
                fontSize: '8px',
                fontFamily: 'Nunito',
            fontStyle: 'bold',
                color: '#ff4444',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5).setDepth(13);
        }

        // Play idle animation (use the sprite type, not enemy type)
        this.animKey = 'enemy-' + spriteType;
        this.anims.play(this.animKey + '-idle');
    }

    update(time, delta) {
        if (this.state === 'DEAD') return;

        // Update cooldowns
        if (this.attackCooldown > 0) this.attackCooldown -= delta;
        if (this.hurtTimer > 0) {
            this.hurtTimer -= delta;
            // Flash effect while hurt
            this.setAlpha(Math.sin(time * 0.02) > 0 ? 0.3 : 1);
            this.setVelocity(0, 0);
            return;
        }
        this.setAlpha(1);

        // Calculate distance to player
        let distToPlayer = Infinity;
        if (this.target) {
            distToPlayer = Phaser.Math.Distance.Between(
                this.x, this.y, this.target.x, this.target.y
            );
        }

        // --- STATE MACHINE ---
        switch (this.state) {
            case 'PATROL':
                this.doPatrol(delta);
                // Switch to CHASE if player is within detection range
                if (distToPlayer < this.detectionRange) {
                    this.state = 'CHASE';
                }
                break;

            case 'CHASE':
                this.doChase();
                // Switch to ATTACK if close enough
                if (distToPlayer < 24) {
                    this.state = 'ATTACK';
                }
                // Give up chasing if player is too far
                if (distToPlayer > this.detectionRange * 2) {
                    this.state = 'PATROL';
                    this.pickNewPatrolTarget();
                }
                break;

            case 'ATTACK':
                this.doAttack(time);
                // Go back to chasing if player moves away
                if (distToPlayer > 30) {
                    this.state = 'CHASE';
                }
                break;

            case 'HURT':
                // Handled by the hurtTimer above
                break;
        }

        // Update the health bar position
        this.updateHealthBar();

        // Update boss name tag position
        if (this.bossNameTag) {
            this.bossNameTag.setPosition(this.x, this.y - 30);
        }

        // Play the right animation based on movement
        this.updateAnimation();
    }

    // --- PATROL BEHAVIOR ---
    // Walk toward a random nearby point, pause, pick a new point, repeat.
    doPatrol(delta) {
        const dist = Phaser.Math.Distance.Between(
            this.x, this.y, this.patrolTargetX, this.patrolTargetY
        );

        if (dist < 5 || this.patrolWaitTime > 0) {
            // Arrived at patrol point — wait a moment
            this.setVelocity(0, 0);
            this.patrolWaitTime -= delta;
            if (this.patrolWaitTime <= 0) {
                this.pickNewPatrolTarget();
                this.patrolWaitTime = Phaser.Math.Between(1000, 3000);
            }
        } else {
            // Move toward patrol target
            this.scene.physics.moveTo(
                this, this.patrolTargetX, this.patrolTargetY,
                this.moveSpeed * 0.5  // Patrol at half speed
            );
        }
    }

    pickNewPatrolTarget() {
        // Pick a random point within 80 pixels of current position
        this.patrolTargetX = this.x + Phaser.Math.Between(-80, 80);
        this.patrolTargetY = this.y + Phaser.Math.Between(-80, 80);
    }

    // --- CHASE BEHAVIOR ---
    // Run straight toward the player.
    doChase() {
        if (!this.target) return;
        this.scene.physics.moveTo(
            this, this.target.x, this.target.y, this.moveSpeed
        );
    }

    // --- ATTACK BEHAVIOR ---
    // Stop moving and damage the player on a cooldown.
    doAttack(time) {
        this.setVelocity(0, 0);

        if (this.attackCooldown <= 0 && this.target) {
            // Deal damage to the player
            this.target.takeDamage(this.attackPower);
            this.attackCooldown = this.attackRate;
        }
    }

    // --- TAKE DAMAGE ---
    // Called by CombatSystem when the player hits this enemy.
    takeDamage(amount) {
        if (this.state === 'DEAD') return;

        // Calculate actual damage (reduced by defense)
        const damage = Math.max(1, amount - this.defensePower);
        this.hp -= damage;

        // Show damage number floating up
        this.showDamageNumber(damage);

        if (this.hp <= 0) {
            this.die();
        } else {
            // Enter hurt state briefly
            this.state = 'HURT';
            this.hurtTimer = 300; // 300ms of stun

            // After hurt, go back to chasing
            this.scene.time.delayedCall(300, () => {
                if (this.state === 'HURT') {
                    this.state = 'CHASE';
                }
            });
        }
    }

    // Show a floating damage number
    showDamageNumber(amount) {
        const uiScene = this.scene.scene.get('UI');
        if (uiScene && uiScene.showFloatingText) {
            uiScene.showFloatingText(this.x, this.y - 10, '-' + amount, '#ff4444', 16, 800);
        }
    }

    // --- DEATH ---
    die() {
        this.state = 'DEAD';
        if (this.scene.soundManager) this.scene.soundManager.play('enemyDie');
        this.setVelocity(0, 0);
        this.body.enable = false;

        // Give rewards to the player
        if (this.target) {
            this.target.xp += this.enemyData.xpReward;
            this.target.gold += this.enemyData.goldDrop;
        }

        // Notify quest manager about the kill (pass position for item drops)
        if (this.scene.questManager) {
            this.scene.questManager.onEnemyKilled(
                this.enemyType,
                this.enemyData.xpReward,
                this.enemyData.goldDrop,
                this.x, this.y
            );
        }

        // Show XP/gold gain text
        const uiScene = this.scene.scene.get('UI');
        if (uiScene && uiScene.showFloatingText) {
            uiScene.showFloatingText(
                this.x, this.y - 10,
                '+' + this.enemyData.xpReward + ' XP  +' + this.enemyData.goldDrop + ' Gold',
                '#f1c40f', 15, 1200
            );
        }

        // Death animation: flash white, spin, burst into particles, then remove
        // 1) Flash white
        this.setTintFill(0xffffff);

        // 2) Spawn death particles (small squares flying outward)
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const particle = this.scene.add.rectangle(
                this.x, this.y, 4, 4, 0xffffff
            ).setDepth(15);

            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * 40,
                y: this.y + Math.sin(angle) * 40,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 400,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }

        // 3) Spin + shrink the enemy sprite
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.healthBar.destroy();
                if (this.bossNameTag) this.bossNameTag.destroy();
                this.destroy();
            }
        });
    }

    // --- HEALTH BAR ---
    updateHealthBar() {
        this.healthBar.clear();

        if (this.hp >= this.maxHP || this.state === 'DEAD') return;

        const barWidth = this.isBoss ? 40 : 24;
        const barHeight = this.isBoss ? 5 : 3;
        const x = this.x - barWidth / 2;
        const y = this.y - (this.isBoss ? 28 : 18);
        const healthPercent = this.hp / this.maxHP;

        // Background (dark red)
        this.healthBar.fillStyle(0x333333, 0.8);
        this.healthBar.fillRect(x, y, barWidth, barHeight);

        // Fill (green → yellow → red based on health)
        if (healthPercent > 0.5) {
            this.healthBar.fillStyle(0x2ecc71, 1);
        } else if (healthPercent > 0.25) {
            this.healthBar.fillStyle(0xf1c40f, 1);
        } else {
            this.healthBar.fillStyle(0xe74c3c, 1);
        }
        this.healthBar.fillRect(x, y, barWidth * healthPercent, barHeight);
    }

    // --- ANIMATION ---
    updateAnimation() {
        const key = this.animKey;
        const vx = this.body.velocity.x;
        const vy = this.body.velocity.y;

        if (Math.abs(vx) < 5 && Math.abs(vy) < 5) {
            // Standing still
            this.anims.play(key + '-idle', true);
            return;
        }

        // Pick direction based on which velocity component is larger
        if (Math.abs(vx) > Math.abs(vy)) {
            if (vx < 0) {
                this.anims.play(key + '-walk-left', true);
            } else {
                this.anims.play(key + '-walk-right', true);
            }
        } else {
            if (vy < 0) {
                this.anims.play(key + '-walk-up', true);
            } else {
                this.anims.play(key + '-walk-down', true);
            }
        }
    }
}
