/*
    X's thing

    Copyright (C) 2022 XWasHere 

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

function c_point(x, y, r, c, ctx) {
	let oc = ctx.strokeStyle;
	ctx.strokeStyle = c;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.strokeStyle = oc;
}

export class PhysPoint {
	x;
	y;
	
	weight;
	
	friends;

	constructor(args) {
		this.x = args?.x ?? 0;
		this.y = args?.y ?? 0;
		
		this.weight = args?.weight ?? 1; 
		
		this.friends = [];
	}

	vec() {
		return [this.x, this.y];
	}
}

export class PhysObject {
	parent;

	fx;
	fy;
	
	gx;
	gy;
	
	vx;
	vy;
	
	x;
	y;
	
	points;
	children;

	constructor(args) {
		this.fx = args?.fx ?? 0;
		this.fy = args?.fy ?? 0;
		this.gx = args?.gx ?? 0;
		this.gy = args?.gy ?? 0;
		this.vx = args?.vx ?? 0;
		this.vy = args?.vy ?? 0;
		this.x  = args?.x  ?? 0;
		this.y  = args?.y  ?? 0;
		
		this.children = [];
		this.points = [];
	}
}

export class PhysEngine {
	viewport;
	context;
	world;
	objects;
	
	constructor(args) {
		this.viewport = args.viewport;
		this.context = this.viewport.getContext("2d");
		this.world = new PhysObject();
		this.objects = [this.world];
	}

	draw(args) {
		let o  = args?.o  ?? this.world;
		let ox = args?.ox ?? 0;
		let oy = args?.oy ?? 0;
		
		for (let i = 0; i < o.points.length; i++) {
			let p = o.points[i];
			for (let i = 0; i < p.friends.length; i++) {
				let f = p.friends[i];

				this.context.beginPath();
				this.context.moveTo(ox + o.x + p.x, oy + o.y + p.y);
				this.context.lineTo(ox + o.x + f.x, oy + o.y + f.y);
				this.context.stroke();
			}
		}

		for (let i = 0; i < o.children.length; i++) {
			this.draw({ o: o.children[i], ox: ox + o.x, oy: oy + o.y });
		}
	}

	exec(args) {
		_0: for (let i = 0; i < this.objects.length; i++) {
			let hits = [];

			let o1 = this.objects[i];

			o1.vx += o1.gx;
			o1.vy += o1.gy;

			_1: for (let i = 0; i < o1.points.length; i++) {
				let p1 = o1.points[i];
				_2: for (let i = 0; i < p1.friends.length; i++) {
					let f1 = p1.friends[i];
					_3: for (let i = 0; i < this.objects.length; i++) {
						let o2 = this.objects[i];
						if (o2 === o1) continue;
						_4: for (let i = 0; i < o2.points.length; i++) {
							let p2 = o2.points[i];
							_5: for (let i = 0; i < p2.friends.length; i++) {
								let f2 = p2.friends[i];

								// http://csharphelper.com/blog/2014/08/determine-where-two-lines-intersect-in-c/#:~:text=Next%20the%20code%20uses%20the%20values%20of%20t1,that%20are%20closest%20to%20the%20point%20of%20intersection.
								let P1 = [p1.x + o1.x, p1.y + o1.y];
								let P2 = [f1.x + o1.x, f1.y + o1.y];
								let P3 = [p2.x + o2.x, p2.y + o2.y];
								let P4 = [f2.x + o2.x, f2.y + o2.y];
								
								let dx12 = P2[0] - P1[0];
								let dy12 = P2[1] - P1[1];
								let dx34 = P4[0] - P3[0];
								let dy34 = P4[1] - P3[1];

								let denominator = (dy12 * dx34 - dx12 * dy34);

								let t1 = ((P1[0] - P3[0]) * dy34 + (P3[1] - P1[1]) * dx34) / denominator;
								// lines intersect
								if (t1 != Infinity) {
									let t2 = ((P3[0] - P1[0]) * dy12 + (P1[1] - P3[1]) * dx12) / -denominator;
									// segments_intersect
									if ((t1 >= 0) && (t1 <= 1) && (t2 >= 0) && (t2 <= 1)) {
										if (t1 < 0)      t1 = 0;
										else if (t1 > 1) t1 = 1;
										if (t2 < 0)      t2 = 0;
										else if (t2 > 1) t2 = 1;
	
										let hitx = P1[0] + dx12 * t1;
										let hity = P1[1] + dy12 * t1;
										
										c_point(hitx, hity, 5, "#00ff00", this.context);

										hits.push({
											p1: p1,
											f1: f1,
											p2: p2,
											f2: f2,
											o1: o1,
											o2: o2,
											hx: hitx,
											hy: hity
										});
									}
								}
							} // _5
						} // _4
					} // _3
				} // _2
			} // _1

			if (hits.length) {
				let lcc = o1.points[0];
				for (let i = 0; i < o1.points.length; i++) {
					let p = o1.points[i];

					if (lcc.x > p.x || lcc.y > p.y) lcc = p;
				}

				let nm = 0;
				let c = [0, 0];
				for (let i = 0; i < o1.points.length; i++) {
					let p = o1.points[i];

					c[0] += p.x * p.weight;
					c[1] += p.y * p.weight;
					nm   += p.weight;
				}

				c = [c[0] / nm||1, c[1] / nm||1];
				c = [c[0] + o1.x, c[1] + o1.y];
				
				//console.log(c);
				
				c_point(c[0], c[1], 5, "#ff0000", this.context);

				o1.vy = -0;
				for (let i = 0; i < hits.length; i++) {
					c_point(hits[i].p1.x + o1.x, hits[i].p1.y + o1.y, 5, "#0000ff", this.context);
					c_point(hits[i].f1.x + o1.x, hits[i].f1.y + o1.y, 5, "#0000ff", this.context);

					if (c[0] < hits[i].hx) {
						o1.vx -= 1;
					} else {
						o1.vx += 1;
					}	
				}
			}

			if (o1.vx > 0) {
				o1.vx -= o1.fx;
				if (o1.vx < 0) o1.vx = 0;
			} else if (o1.vx < 0) {
				o1.vx += o1.fx;
				if (o1.vx > 0) o1.vx = 0;
			}
			if (o1.vy > 0) {
				o1.vy -= o1.fy;
				if (o1.vy < 0) o1.vy = 0;
			} else if (o1.vy < 0) {
				o1.vy += o1.fy;
				if (o1.vy > 0) o1.vy = 0;
			}
			
			o1.x += o1.vx;
			o1.y += o1.vy;
		} // _0
	}
}

