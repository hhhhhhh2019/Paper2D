class Player extends _Rect {
	constructor(x, y, w, h, sp = 1) {
		super(game, x, y, w, h, "", "textures/player_sprite.png", true, true, 1);
		this.speed = sp;
		this.setAnimation(0, 0, 19, 19, 19, 0, 100, 19)
		game.childs.push(this);

		this.on_floor = false;
	}

	onCollision(obj, dir) {
		this.on_floor = dir == "bottom";
	}

	onUpdate() {
		if (isPress("Left")) this.dx = -this.speed;
		else if (isPress("Right")) this.dx = this.speed;
		else this.dx = 0;

		this.dy += 0.1;

		if (this.on_floor == true) {
			if (isPress("Up")) 
				this.dy = -this.speed*2;
		}

		this.on_floor = false

		if (this.y + this.h > _H) location.reload();

		game.cam_x = this.x + this.w / 2 - _W / 2 - this.dx;
		game.cam_y = this.y + this.y / 2 - _H / 3;
	}
}

class Platform extends _Rect {
	constructor(x, y, w, h) {
		super(game, x, y, w, h, "", "textures/Tiles/tile_0008.png", false, true, 1);
		game.childs.push(this);
	}
}