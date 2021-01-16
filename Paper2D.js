let _W = 0;
let _H = 0;
let _C = "";
let _this = null;


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
	constructor(w, h, c) {
		_W = w || _W;
		_H = h || _H;
		_C = c || _C;

		this.cnv = document.createElement('canvas');
		this.cnv.width = _W;
		this.cnv.height = _H;
		this.cnv.style.backgroundColor = _C;
		this.ctx = this.cnv.getContext("2d");

		_this = this;

		this.childs = [];

		this.run = false;
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
		_this.ctx.clearRect(0, 0, _W, _H);
		_this.Update();
		if (_this.run) _step(_this.Engine)
	}

	CreateRect(x, y, w, h, c, img = null, k = true, cc = true, m = 1, onUpd = null, onColl = null, onCrt = null) {
		let o = new _Rect(x, y, w, h, c, img, k, cc, m);
		o.onUpdate = onUpd || function(){};
		o.onCollision = onColl || function(o, d){};
		o.onCreate = onCrt || function() {;}
		o.onCreate();
		this.childs.push(o);
	}

	CreateSprite(x, y, w, h, img = null) {
		let o = new _Sprite(x, y, w, h, img);
		this.childs.push(o);
	}

	CreateTileMap(x, y, t, m, w, h) {
		let o = new _TileMap(x, y, t, m, w, h);
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

	draw() {
		_this.ctx.fillStyle = 'yellow';
		_this.ctx.fillRect(this.x, this.y, this.w, this.h);
	}
}

class _Rect {
	constructor(x, y, w, h, c, img, k, cc, m) {
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

		this.tag = null;
	}

	draw() {
		if (this.img) {
			let img = getImage(this.img);
			if (img) {
				_this.ctx.drawImage(img, this.x, this.y, this.w, this.h);
			}
		}

		else {
			_this.ctx.fillStyle = this.c;
			_this.ctx.fillRect(this.x - 0.5, this.y - 0.5, this.w + 1, this.h + 1);
		}
	}

	move() {
		let cx = 0;
		let cy = 0;

		if (this.kinematic == true && this.can_coll == true) {
			for (let i of _this.childs) {
				if (i == this || i.can_coll == false) continue;

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
	constructor(x, y, w, h, img) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.img = img;
		loadImage(img);
	}

	draw() {
		let img = getImage(this.img);
		if (img) {
			_this.ctx.drawImage(img, this.x, this.y, this.w, this.h);
		}
	}
}


class _TileMap {
	constructor(x, y, t, m, w, h) {
		this.x = x;
		this.y = y;
		this.t = t;
		this.m = m;
		this.w = w;
		this.h = h;

		this.childs = [];
		this.tiles = {};

		this.loadTiles();
	}

	loadTiles() {
		this.childs = [];
		this.tiles = {};

		for (let i in this.t) {
			loadImage(this.t[i]["texture"]);
			this.tiles[i] = this.t[i];
		}

		for (let k of this.m) {
			for (let i = 0; i < k.length; i++) {
				for (let j = 0; j < k[i].length; j++) {
					let tile = this.tiles[k[i][j]];

					let xs = tile["scale_w"];
					let ys = tile["scale_h"];
					let coll = tile["collision"];
					let ox = tile["offset_x"];
					let oy = tile["offset_y"];

					if (xs == undefined) xs = 1;
					if (ys == undefined) ys = 1;
					if (ox == undefined) ox = 0;
					if (oy == undefined) oy = 0;

					if (coll == undefined) coll = false;

					if (coll == true)// x, y, w, h, c, img, k, cc, m
						this.childs.push(new _Rect(ox + this.x + j * this.w, oy + this.y + i * this.h, this.w * xs, this.h * ys, "", tile["texture"], false, true, 0));
					else
						this.childs.push(new _Sprite(ox + this.x + j * this.w, oy + this.y + i * this.h, this.w * xs, this.h * ys, tile["texture"]));
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