class Player extends _Rect {
	constructor(x, y, w, h, sp = 1) {
		super(x, y, w, h, "green", "", true, true, 1);
		this.speed = sp;
		game.childs.push(this);

		this.on_floor = false;
	}

	onCollision(obj, dir) {
		if (dir == "bottom") this.on_floor = true;
		else this.on_floor = false;
	}

	onUpdate() {
		if (isPress("Left")) this.dx = -this.speed;
		else if (isPress("Right")) this.dx = this.speed;
		else this.dx = 0;

		if (this.on_floor == true) {
			if (isPress("Up")) {
				this.dy = -this.speed;
			}
			else this.dy = 0;
		}
		else this.dy += 0.1;
	}
}

class Platform extends _Rect {
	constructor(x, y, w, h) {
		super(x, y, w, h, "", "textures/kirpich.bmp", false, true, 1);
		game.childs.push(this);
	}
}