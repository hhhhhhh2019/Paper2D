let _step = (function() {
	return requestAnimationFrame ||
	mozRequestAnimationFrame ||
	oRequestAnimationFrame ||
	webkitRequestAnimationFrame ||
	msRequestAnimationFrame ||
	function (callback) {
		setTimeout(callback, 1000/60);
	}
})();

function inArray(arr, v) {
	for (let i of arr) {
		if (i == v) return true
	}
	
	return false;
}

function _rect_rect(a, b) {
	if (a.x + a.w >= b.x && a.x <= b.x + b.w) {
		if (a.y + a.h >= b.y && a.y <= b.y + b.h) {
			return true
		}
	}
	
	return false
}


var _images = {};

function loadImage(img) {
	if (_images.hasOwnProperty(img)) return;
	let image = new Image();
	image.src = img;
	image.onload = function() {
		_images[img] = image;
	}
}

function getImage(img) {
	try {
		return _images[img];
	}

	catch(e) {
		return null;
	}
}


class Paper2D {
	constructor(w, h, c, img) {
		this.w = w || 0;
		this.h = h || 0;
		this.c = c || "";

		this.cnv = document.createElement('canvas');
		this.cnv.width = this.w;
		this.cnv.height = this.h;
		this.cnv.style.backgroundColor = this.c;
		this.ctx = this.cnv.getContext("2d");
		this.ctx.font = '20px serif';
		this.ctx.textAlign = "center";

		this.img = img;
		if (img) loadImage(img);

		this.childs = [];

		this.run = false;

		this.cam_x = 0;
		this.cam_y = 0;
		
		this.animation_x = 0;
		this.animation_y = 0;
		this.animation_w = 0;
		this.animation_h = 0;
		this.animation_dx = 0;
		this.animation_dy = 0;
		this.animation_max_x = 0;
		this.animation_max_y = 0;
		this.animation_frame = 0;
		this.animation_speed = 0; 
		
		this.animate = false;
	}
	
	setAnimation(x, y, w, h, dx, dy, mx, my, sp=1) {
		this.animation_x = x;
		this.animation_y = y;
		this.animation_w = w;
		this.animation_h = h;
		this.animation_dx = dx;
		this.animation_dy = dy;
		this.animation_max_x = mx;
		this.animation_max_y = my;
		this.animation_speed = sp;
		
		this.animate = true;
	}

	Start() {
		document.body.appendChild(this.cnv);
		this.run = true;
		this.Engine();
	}

	Stop() {
		this.run = false;
	}

	Update() {
		for (let i of this.childs) {
			i.onUpdate();
			if (i.kinematic) i.move();
			i.draw();
		}
	}

	Engine() {
		if (this.img == null)
			this.ctx.clearRect(0, 0, this.w, this.h);
		else {
			let img = getImage(this.img);
			if (img) {
				if (this.animate) {
					this.ctx.drawImage(img, 
					this.animation_x, this.animation_y, this.animation_w, this.animation_h,
					0, 0, this.w, this.h);
					
					if (this.animation_frame >= 1) {
						this.animation_x = (this.animation_x + this.animation_dx) % this.animation_max_x;
						this.animation_y = (this.animation_y + this.animation_dy) % this.animation_max_y;
						this.animation_frame = 0;
					}
					else this.animation_frame += this.animation_speed;
				}
				else this.ctx.drawImage(img, 0, 0, this.w, this.h);
			}
		}
		this.Update();
		if (this.run) _step(this.Engine.bind(this))
	}

	CreateRect(x, y, w, h, c, img = null, k = true, cc = true, m = 1, onUpd = null, onColl = null, onCrt = null, tag = null) {
		let o = new _Rect(this, x, y, w, h, c, img, k, cc, m, tag);
		o.onUpdate = onUpd || function(){};
		o.onCollision = onColl || function(o, d){};
		o.onCreate = onCrt || function() {}
		o.onCreate();
		this.childs.push(o);
	}

	CreateSprite(x, y, w, h, img = null, tag = null) {
		let o = new _Sprite(this, x, y, w, h, img, tag);
		this.childs.push(o);
	}

	CreateTileMap(x, y, t, m, w, h) {
		let o = new _TileMap(this, x, y, t, m, w, h);
		this.childs.push(o);
	}
}

class Box {
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
}

class _Rect {
	constructor(p, x, y, w, h, c, img, k, cc, m, tag=null) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.c = c;
		this.img = img;
		if (img) loadImage(img);

		this.kinematic = k;
		this.mass = m;
		this.can_coll = cc;

		this.dx = 0;
		this.dy = 0;

		this.tag = tag;

		this.p = p;

		this.animation_x = 0;
		this.animation_y = 0;
		this.animation_w = 0;
		this.animation_h = 0;
		this.animation_dx = 0;
		this.animation_dy = 0;
		this.animation_max_x = 0;
		this.animation_max_y = 0;
		this.animation_frame = 0;
		this.animation_speed = 0;
		this.animation_start_x = 0;
		this.animation_start_y = 0; 
		
		this.animate = false;
	}

	setAnimation(x, y, w, h, dx, dy, mx, my, sp=1) {
		this.animation_x = x;
		this.animation_y = y;
		this.animation_start_x = x;
		this.animation_start_y = y;
		this.animation_w = w;
		this.animation_h = h;
		this.animation_dx = dx;
		this.animation_dy = dy;
		this.animation_max_x = mx;
		this.animation_max_y = my;
		this.animation_speed = sp;

		this.animate = true;
	}

	draw() {
		if (this.img) {
			let img = getImage(this.img);
			if (img) {
				if (this.animate) {
					this.p.ctx.drawImage(img, 
						this.animation_x, this.animation_y, this.animation_w, this.animation_h,
						this.x-this.p.cam_x, this.y-this.p.cam_y, this.w, this.h);
					
					if (this.animation_frame >= 1) {
						this.animation_x = (this.animation_x + this.animation_dx) % this.animation_max_x;
						this.animation_y = (this.animation_y + this.animation_dy) % this.animation_max_y;
						this.animation_frame = 0;

						if (this.animation_x < this.animation_start_x) this.animation_x = this.animation_start_x;
						if (this.animation_y < this.animation_start_y) this.animation_y = this.animation_start_y;
					}
					else this.animation_frame += this.animation_speed;   
				}
				else this.p.ctx.drawImage(img, this.x-this.p.cam_x, this.y-this.p.cam_y, this.w, this.h);
			}
			else {
				this.p.ctx.fillStyle = this.c;
				this.p.ctx.fillRect(this.x - 0.5 - this.p.cam_x, this.y - 0.5 - this.p.cam_y, this.w + 1, this.h + 1);
			}
		}

		else {
			this.p.ctx.fillStyle = this.c;
			this.p.ctx.fillRect(this.x - 0.5 - this.p.cam_x, this.y - 0.5 - this.p.cam_y, this.w + 1, this.h + 1);
		}
	}

	move() {
		let cx = 0;
		let cy = 0;

		if (this.kinematic == true && this.can_coll == true) {
			for (let i of this.p.childs) {
				if (i == this || i.can_coll == false || i instanceof _Sprite) continue;

				if (i instanceof _TileMap) {
					for (let j of i.childs) {
						if (j.can_coll == false) continue;
						if (!(j instanceof _Rect)) continue;

						let left = new Box(this.x-1, this.y+5, 1, this.h-10);
						let right = new Box(this.x+this.w+1, this.y+5, 1, this.h-10);

						let top = new Box(this.x+5, this.y-1, this.w-10, 1);
						let bottom = new Box(this.x+5, this.y+this.h+1, this.w-10, 1);

						if (_rect_rect(left, j)) {cx=-1; this.onCollision(j, "left")};
						if (_rect_rect(right, j)) {cx=1; this.onCollision(j, "right");}

						if (_rect_rect(top, j)) {cy=-1; this.onCollision(j, "top");}
						if (_rect_rect(bottom, j)) {cy=1; this.onCollision(j, "bottom");}
					}
				}

				else {
					let left = new Box(this.x-1, this.y+5, 1, this.h-10);
					let right = new Box(this.x+this.w+1, this.y+5, 1, this.h-10);

					let top = new Box(this.x+5, this.y-1, this.w-10, 1);
					let bottom = new Box(this.x+5, this.y+this.h+1, this.w-10, 1);

					if (_rect_rect(left, i)) {cx=-1; this.onCollision(i, "left")};
					if (_rect_rect(right, i)) {cx=1; this.onCollision(i, "right");}

					if (_rect_rect(top, i)) {cy=-1; this.onCollision(i, "top");}
					if (_rect_rect(bottom, i)) {cy=1; this.onCollision(i, "bottom");}
				}
			}
		}

		//console.log(cx, cy, this.dx, this.dy);

		if (cx < 0 && this.dx < 0) this.dx = 0;
		if (cx > 0 && this.dx > 0) this.dx = 0;
		if (cy < 0 && this.dy < 0) this.dy = 0;
		if (cy > 0 && this.dy > 0) this.dy = 0;

		this.x += this.dx;
		this.y += this.dy;
	}

	onUpdate() {}
	onCollision(o, d) {}
	onCreate() {}
}


class _Sprite {
	constructor(p, x, y, w, h, img, tag = null) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.img = img;
		this.p = p;
		this.tag = tag;
		loadImage(img);
	}

	draw() {
		let img = getImage(this.img);
		if (img) {
			this.p.ctx.drawImage(img, this.x - this.p.cam_x, this.y - this.p.cam_y, this.w, this.h);
		}
	}
	
	onUpdate() {}
	onCollision(o, d) {}
	onCreate() {}
}


class _TileMap {
	constructor(p, x, y, t, m, w, h) {
		this.x = x;
		this.y = y;
		this.t = t;
		this.m = m;
		this.w = w;
		this.h = h;
		this.p = p;

		this.childs = [];
		this.tiles = {};

		this.loadTiles();
	}

	loadTiles() {
		this.childs = [];
		this.tiles = {};

		for (let i in this.t) {
			loadImage(this.t[i].texture);
			this.tiles[i] = this.t[i];
		}

		for (let k of this.m) {
			for (let i = 0; i < k.length; i++) {
				for (let j = 0; j < k[i].length; j++) {
					let tile = this.tiles[k[i][j]];

					let xs = tile.scale_w;
					let ys = tile.scale_h;
					let coll = tile.collision;
					let ox = tile.offset_x;
					let oy = tile.offset_y;

					if (xs == undefined) xs = 1;
					if (ys == undefined) ys = 1;
					if (ox == undefined) ox = 0;
					if (oy == undefined) oy = 0;

					if (coll == undefined) coll = false;

					if (coll == true)// x, y, w, h, c, img, k, cc, m
						this.childs.push(new _Rect(this.p, ox + this.x + j * this.w, oy + this.y + i * this.h, this.w * xs, this.h * ys, "", tile["texture"], false, true, 0));
					else
						this.childs.push(new _Sprite(this.p, ox + this.x + j * this.w, oy + this.y + i * this.h, this.w * xs, this.h * ys, tile["texture"]));
				}
			}
		}
	}

	draw() {
		for (let i of this.childs) {
			i.draw();
		}
	}

	onUpdate() {}
	onCollision(o, d) {}
	onCreate() {}
}


var _Keys = {
	'0': 48,
	'1': 49,
	'2': 50,
	'3': 51,
	'4': 52,
	'5': 53,
	'6': 54,
	'7': 55,
	'8': 56,
	'9': 57,
	"'": 222,
	'-': 189,
	'/': 191,
	';': 186,
	'=': 187,
	'Backspace': 8,
	'Tab': 9,
	'[': 219,
	']': 221,
	'a': 65,
	'b': 66,
	'c': 67,
	'd': 68,
	'e': 69,
	'f': 70,
	'g': 71,
	'h': 72,
	'i': 73,
	'j': 74,
	'k': 75,
	'l': 76,
	'm': 77,
	'n': 78,
	'o': 79,
	'p': 80,
	'q': 81,
	'r': 82,
	's': 83,
	't': 84,
	'u': 85,
	'v': 86,
	'w': 87,
	'x': 88,
	'y': 89,
	'z': 90,
	'Space': 32,
	'*': 106,
	'+': 107,
	'-': 109,
	'.': 110,
	'/': 111,
	'Down': 40,
	'Left': 37,
	'Right': 39,
	'Up': 38,
	'CapsLock': 20,
	'Sift': 16,
	'Alt': 18,
	'Control': 17,
	';': 186,
	'Esc': 27,
	'F1': 112,
	'F2': 113,
	'F3': 114,
	'F4': 115,
	'F5': 116,
	'F6': 117,
	'F7': 118,
	'F8': 119,
	'F9': 120,
	'F10': 121,
	'F11': 122,
	'F12': 123,
	'Delete': 46,
	'End': 35,
	'Escape': 27,
	'Home': 36,
	'Insert': 45,
	'PageDown': 34,
	'PageUp': 33,
	'Pause': 19,
	'ScrollLock': 145,
}

let _PressedKeys = {};

let _DownKeys = {};
let _UpKeys = {};

let k = {};

function _OnKeyDown(e) {
	if (!_PressedKeys[e.keyCode]) {
		_DownKeys[e.keyCode] = true;
	}
	_PressedKeys[e.keyCode] = true;
	k[e.key] = e.keyCode
}

function _OnKeyUp(e) {
	_PressedKeys[e.keyCode] = false;
	_UpKeys[e.keyCode] = true;
}

document.addEventListener('keydown', _OnKeyDown);
document.addEventListener('keyup', _OnKeyUp);

function isPress(key) {
	return !!_PressedKeys[_Keys[key]];
}

function isDown(key) {
	return !!_DownKeys[_Keys[key]];
}

function isUp(key) {
	return !!_UpKeys[_Keys[key]];
}
