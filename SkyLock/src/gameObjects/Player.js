export class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.speed = 200;

        // Initialize the physics group
        this.group = scene.physics.add.group({
            collideWorldBounds: true,
            allowGravity: false
        });

        const allKeys = scene.textures.getTextureKeys();
        const spriteKeys = allKeys.filter(key => key.startsWith('sprite'));

        spriteKeys.forEach((key, index) => {
            const offsetX = index * 30; 
            const angel = this.group.create(x + offsetX, y, key);
            
            // Initialize custom properties
            angel.isDragged = false;
            angel.onIsland = false;
            angel.currentIsland = null;

            angel.body.setBounce(1, 1);
            angel.setScale(0.1);
            this.randomLaunch(angel);

            // Drag and Drop Logic
            angel.setInteractive();
            scene.input.setDraggable(angel);

            angel.on('dragstart', () => {
                angel.isDragged = true;
                angel.onIsland = false;
                angel.setTint(0xff0000);
            });

            angel.on('drag', (pointer, dragX, dragY) => {
                angel.body.setVelocity(0, 0);
                angel.x = dragX;
                angel.y = dragY;
            });

            angel.on('dragend', () => {
                angel.isDragged = false;
                angel.clearTint();
                this.randomLaunch(angel);
            });
        });

        // Handle overlap with islands
        scene.physics.add.overlap(this.group, scene.platforms, (angel, island) => {
            if (!angel.isDragged) {
                angel.onIsland = true;
                angel.currentIsland = island;
            }
        });

        // Self-collision (angels bump into each other)
        scene.physics.add.collider(this.group, this.group);
    }

    randomLaunch(sprite) {
        const angle = Phaser.Math.Between(0, 360);
        this.scene.physics.velocityFromAngle(angle, this.speed, sprite.body.velocity);
    }

    update() {
        this.group.getChildren().forEach(angel => {
            if (angel.onIsland && !angel.isDragged && angel.currentIsland) {
                const bounds = angel.currentIsland.getBounds();
                let hit = false;

                // Simple boundary bounce logic
                if (angel.x > bounds.right && angel.body.velocity.x > 0) {
                    angel.body.velocity.x *= -1;
                    hit = true;
                } else if (angel.x < bounds.left && angel.body.velocity.x < 0) {
                    angel.body.velocity.x *= -1;
                    hit = true;
                }

                if (angel.y > bounds.bottom && angel.body.velocity.y > 0) {
                    angel.body.velocity.y *= -1;
                    hit = true;
                } else if (angel.y < bounds.top && angel.body.velocity.y < 0) {
                    angel.body.velocity.y *= -1;
                    hit = true;
                }

                // Maintain constant speed
                if (hit) {
                    const angle = Math.atan2(angel.body.velocity.y, angel.body.velocity.x);
                    this.scene.physics.velocityFromRotation(angle, this.speed, angel.body.velocity);
                }
            }
        });
    }

    get body() { 
        const children = this.group.getChildren();
        return children.length > 0 ? children[0].body : null; 
    }
}