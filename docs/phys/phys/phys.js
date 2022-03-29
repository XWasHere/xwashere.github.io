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

function v_sub(a, b)   { return [a[0] - b[0], a[1] - b[1]]; }
function v_add(a, b)   { return [a[0] + b[0], a[1] + b[1]]; }
function v_cross(a, b) { return  a[0] * b[1] - a[1] * b[0]; }

function c_point(x, y, r, c, ctx) {
	let oc = ctx.strokeStyle;
	ctx.strokeStyle = c;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.strokeStyle = oc;
}

function c_line(x1, y1, x2, y2, c, ctx) {
	let oc = ctx.strokeStyle;
	ctx.strokeStyle = c;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
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
		this.vr = args?.vr ?? 0;
		this.r  = args?.r  ?? 0;
		this.x  = args?.x  ?? 0;
		this.y  = args?.y  ?? 0;
		this.s  = args?.s  ?? 0;
		
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
			let p1 = o.points[i];
			let p2 = o.points[(i+1) % o.points.length];

			// messing with this chunk makes some funny effects, looks like paper blowing in the wind
			let p1x = o.x + (p1.x * Math.cos(o.r) - p1.y * Math.sin(o.r));
			let p1y = o.y + (p1.y * Math.cos(o.r) + p1.x * Math.sin(o.r));
			let p2x = o.x + (p2.x * Math.cos(o.r) - p2.y * Math.sin(o.r));
			let p2y = o.y + (p2.y * Math.cos(o.r) + p2.x * Math.sin(o.r));
			
			this.context.beginPath();
			this.context.moveTo(ox + p1x, oy + p1y);
			this.context.lineTo(ox + p2x, oy + p2y);
			this.context.stroke();
		}

		for (let i = 0; i < o.children.length; i++) {
			this.draw({ o: o.children[i], ox: ox + o.x, oy: oy + o.y });
		}
	}

	lines_intersect(a, b) {
		// http://csharphelper.com/blog/2014/08/determine-where-two-lines-intersect-in-c/#:~:text=Next%20the%20code%20uses%20the%20values%20of%20t1,that%20are%20closest%20to%20the%20point%20of%20intersection.
		let p1 = [a[0], a[1]];
		let p2 = [a[2], a[3]];
		let p3 = [b[0], b[1]];
		let p4 = [b[2], b[3]];

		let dx12 = p2[0] - p1[0];
		let dy12 = p2[1] - p1[1];
		let dx34 = p4[0] - p3[0];
		let dy34 = p4[1] - p3[1];

		let denominator = (dy12 * dx34 - dx12 * dy34);

		let t1 = ((p1[0] - p3[0]) * dy34 + (p3[1] - p1[1]) * dx34) / denominator;

		if (t1 != Infinity) {
			let t2 = ((p3[0] - p1[0]) * dy12 + (p1[1] - p3[1]) * dx12) / -denominator;
			if ((t1 >= 0) && (t1 <= 1) && (t2 >= 0) && (t2 <= 1)) {
				if (t1 < 0)      t1 = 0;
				else if (t1 > 1) t1 = 1;
				if (t2 < 0)      t2 = 0;
				else if (t2 > 1) t2 = 1;

				let hitx = p1[0] + dx12 * t1;
				let hity = p1[1] + dy12 * t1;
				
				return [hitx, hity];
			} else return 0;
		} else return 0;
	}
	
	// thanks (psuedocode: https://www.tutorialspoint.com/Check-if-a-given-point-lies-inside-a-Polygon)
	point_in_polygon(pt, pg) {
		if (pg.pnts.length < 3) return 0;
		let exline = [pt.x, pt.y, 1000000, pt.y];
		let count = 0, i = 0;
		do {
			let side = [pg.pnts[i].x, pg.pnts[i].y, pg.pnts[(i + 1) % pg.pnts.length].x, pg.pnts[(i + 1) % pg.pnts.length].y]
			if (this.lines_intersect(side, exline)) {
				// c_line(side[0], side[1], side[2], side[3], "#00ff00", this.context);
				count++;
			}
			i = (i + 1) % pg.pnts.length;
		} while (i);
		return count & 1
	}

	exec(args) {
		// predict
		let wd = { cur: this, objs: [] };
		for (let i0 = 0; i0 < this.objects.length; i0++) {
			let ro = this.objects[i0];
			let po = {
				cur:  ro,
				pnts: [],
				vx:   ro.vx,
				vy:   ro.vy,
				x:    ro.x + ro.vx,
				y:    ro.y + ro.vy,
				r:    ro.r + ro.vr
			};

			for (let i1 = 0; i1 < ro.points.length; i1++) {
				let p = ro.points[i1];
				po.pnts.push({
					cur: p,
					x:   po.x + (p.x*Math.cos(po.r) - p.y*Math.sin(po.r)),
					y:   po.y + (p.y*Math.cos(po.r) + p.x*Math.sin(po.r)),
				});
			}

			wd.objs.push(po);
		}

		for (let i0 = 0; i0 < wd.objs.length; i0++) {
			let o1   = wd.objs[i0];

			let issues = [];
			
			// detect
			for (let i1 = 0; i1 < wd.objs.length; i1++) {
				let o2 = wd.objs[i1];
				if (o1 == o2) continue;
				for (let i2 = 0; i2 < o1.pnts.length; i2++) {
					let p1 = o1.pnts[i2];
					let p2 = o1.pnts[(i2 + 1) % o1.pnts.length];
					
					// c_point(p1.x, p1.y, 5, "#ff0000", this.context);
					// c_line(p1.x, p1.y, p2.x, p2.y, "#ff0000", this.context);

					if (this.point_in_polygon(p1, o2)) {
						//c_point(p1.x, p1.y, 5, "#00ff00", this.context);
						issues.push({
							point: p1,
							owner: o1,
							cause: o2
						});
					}
				}
			}

			// solve
			if (issues.length) {
				for (let i1 = 0; i1 < issues.length; i1++) {
					let issue = issues[i1];

					let p1 = issue.point;
					let o1 = issue.owner;
					let o2 = issue.cause;
					
//					c_point(p1.x, p1.y, 5, "#ff0000", this.context);

					let csp  = [];
					let csd  = Infinity;
					let csup = null;
					let csud = Infinity;
					let csdp = null;
					let csdd = Infinity;
					
					for (let i2 = 0; i2 < o2.pnts.length; i2++) {
						let p2 = o2.pnts[i2];
						let p3 = o2.pnts[(i2+1) % o2.pnts.length];
						
						let p4cu = this.lines_intersect([p2.x, p2.y, p3.x, p3.y], [p1.x, p1.y,  p1.x,    -1000000]);
						let p4cd = this.lines_intersect([p2.x, p2.y, p3.x, p3.y], [p1.x, p1.y,  p1.x,     1000000]);
						let p4cl = this.lines_intersect([p2.x, p2.y, p3.x, p3.y], [p1.x, p1.y,  1000000,  p1.y]);
						let p4cr = this.lines_intersect([p2.x, p2.y, p3.x, p3.y], [p1.x, p1.y, -1000000,  p1.y]);
						
						if (p4cu) {
							let d = Math.hypot(p4cu[0] - p1.x, p4cu[1] - p1.y);
							if (d < csd) {
								csd = d;
								csp = p4cu;
							}
							if (d < csud) {
								csud = d;
								csup = p4cu;
							}
						//	c_line(p1.x, p1.y, p4cu[0], p4cu[1], "#0000ff", this.context);
						}

						if (p4cd) {
							let d = Math.hypot(p4cd[0] - p1.x, p4cd[1] - p1.y);
							if (d < csd) {
								csd = d;
								csp = p4cd;
							}
							if (d < csdd) {
								csdd = d;
								csdp = p4cd;
							}
//							c_line(p1.x, p1.y, p4cd[0], p4cd[1], "#0000ff", this.context);
						}

						if (p4cl) {
							let d = Math.hypot(p4cl[0] - p1.x, p4cl[1] - p1.y);
							if (d < csd) {
								csd = d;
								csp = p4cl;
							}
							//c_line(p1.x, p1.y, p4cl[0], p4cl[1], "#0000ff", this.context);
						}

						if (p4cr) {
							let d = Math.hypot(p4cr[0] - p1.x, p4cr[1] - p1.y);
							if (d < csd) {
								csd = d;
								csp = p4cr;
							}
							// c_line(p1.x, p1.y, p4cr[0], p4cr[1], "#0000ff", this.context);
						}

//						c_point(p2[0], p2[1], 4, "#00ff00", this.context);

						c_line(p1.x, p1.y, p2.x, p2.y, "#00ff00", this.context);
					}

					c_line(p1.x, p1.y, csp[0], csp[1], "#ff0000", this.context);

					if (csup) {
						if (p1.y > csup[1]) {
							if (o1.y < o2.y) {
								let os = p1.y - csup[1];
								o1.y -= os;
								for (let i2 = 0; i2 < o1.pnts.length; i2++) {
									o1.pnts[i2].y -= os;
								}	
							}
						}
					}

					if (csdp) {
						if (p1.y < csdp[1]) {
							if (o1.y > o2.y) {
								let os = csdp[1] - p1.y - o2.vy;
								o2.y -= os;
								//c_point(csdp[0], csdp[1], 4, "#0000ff", this.context);
								for (let i2 = 0; i2 < o2.pnts.length; i2++) {
									o2.pnts[i2].y -= os;
								}
							}
						}
					}
					
					//o1.x -= p1.x - csp[0];
					//console.log(issue);
				}
			}
			
			o1.cur.x  = o1.x;
			o1.cur.y  = o1.y;
			o1.cur.r  = o1.r;
			o1.cur.vx = o1.vx;
			o1.cur.vy = o1.vy;
		}
	}
}

