export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    // Note: UI for the preloader must be created when the scene systems are available.

    preload() {
        // Guard: if the scene loader isn't available, bail and log.
        if (!this.load) {
            // Helpful debug output for runtime investigation.
            // If this logs, Phaser scene systems are not ready when preload ran.
            // Avoid throwing so dev server/debugger can show more info.
            // eslint-disable-next-line no-console
            console.error('Preloader.preload: `this.load` is undefined', this);
            return;
        }

        // Store progress value; avoid creating display objects here because
        // some scene display systems may not be ready when `preload()` runs.
        this._loadProgress = 0;
        this.load.on('progress', (progress) => {
            this._loadProgress = progress;
        });

        // Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        this.load.image('sky', 'sky.png');
        this.load.image('ground', 'platform.png');
        this.load.image('star', 'star.png');
        this.load.image('bomg', 'bomb.png');
        this.load.image('chud','fat.jpg');
        this.load.image('ground2', 'Dilly.png')
        this.load.image('sprite1','sprite1.PNG');
        this.load.image('sprite2','sprite2.PNG');
        this.load.image('sprite3','sprite3.PNG');
        this.load.image('sprite4','sprite4.PNG');
        this.load.image('sprite5','sprite 5.PNG');
        this.load.image('sprite6','sprite6.PNG');
        this.load.image('island', 'Bell-flower-isle.PNG')
        this.load.image('island2', 'Cloud-moon-isle.PNG')
        this.load.image('island3', 'Dark-trap-isle.PNG')
        this.load.image('island4', 'Sunflower-isle.PNG')
        
        this.load.spritesheet(
            'dude',
            'dude.png',
            {frameWidth: 32, frameHeight: 48}
        );
        this.load.spritesheet(
            'dude2',
            'guy2.png',
            {frameWidth: 341, frameHeight: 341}
        );
        // this.load.spritesheet(
        //     'sprite1',
        //     'sprite1.PNG',
        //     {frameWidth: 341, frameHeight: 341}
        // )

    }

    create() {
        // // Display background (loaded in Boot)
        // this.add.image(512, 384, 'background');

        // // Progress bar outline and fill (assets are already loaded at this point)
        // this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
        // const bar = this.add.rectangle(512 - 230, 384, 4 + (460 * this._loadProgress), 28, 0xffffff);

        // //  Move to Game now that everything's ready.
        this.scene.start('Game');
    }
}
