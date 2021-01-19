class Player extends _Rect {
	constructor(x, y, w, h, sp = 1) {
		super(game, x, y, w, h, "", "textures/player.png", true, true, 1);
		this.speed = sp;
		this.setAnimation(160, 0, 31, 52, 31, 0, 1, 248, 0.1)
		game.childs.push(this);

		this.on_floor = false;

		this.last_dir = "";
	}

	onCollision(obj, dir) {
		this.on_floor = dir == "bottom";
	}

	onUpdate() {
		if (isPress("Left")) {
			if (this.last_dir != "Left" || this.dx >= 0) this.setAnimation(0, 128, 31, 52, 31, 0, 248, 248, 0.1)
			this.dx = -this.speed;
			this.last_dir = "Left"
		}
		else if (isPress("Right")) {
			if (this.last_dir != "Right" || this.dx <= 0) this.setAnimation(0, 0, 31, 52, 31, 0, 248, 248, 0.1)
			this.dx = this.speed;
			this.last_dir = "Right"
		}
		else {
			this.dx = 0;
			if (this.last_dir == "Right") this.setAnimation(160, 0, 31, 52, 31, 0, 1, 248, 0.1)
			if (this.last_dir == "Left") this.setAnimation(160, 128, 31, 52, 31, 0, 1, 248, 0.1)
		}

		this.dy += 0.1;

		if (this.on_floor == true) {
			if (isPress("Up")) 
				this.dy = -this.speed*2;
		}

		this.on_floor = false

		if (this.y + this.h > game.h) location.reload();

		game.cam_x = this.x + this.w / 2 - game.w / 2 - this.dx;
		game.cam_y = this.y + this.y / 2 - game.h / 3;


		for (let o in game.childs) {
			if (o.tag == "NPC") {
				if (_rect_rect(i, this)) {
					this.onNPCCollide(o);
					break;
				}
			}
		}
	}

	onNPCCollide(obj) {
		obj.say();
	}
}


class NPC extends _Sprite {
	constructor(x, y, w, h, name, text) {
		super(game, x, y, w, h, "textures/npc.png", "NPC");
		this.name = name;
		this.text = text;

		game.childs.push(this);
	}

	onUpdate() {
		this.say()
	}

	say() {
		game.ctx.fillStyle = "black";
		game.ctx.font = '20px serif';
		game.ctx.fillText(this.text, this.x - game.cam_x + this.w / 2, this.y - game.cam_y - this.h / 3);

		game.ctx.fillStyle = "yellow";
		game.ctx.strokeStyle = "black";
		game.ctx.font = '10px serif';
		game.ctx.fillText(this.name, this.x - game.cam_x + this.w / 2, this.y - game.cam_y - 2);
		game.ctx.strokeText(this.name, this.x - game.cam_x + this.w / 2, this.y - game.cam_y - 2);
	}
}