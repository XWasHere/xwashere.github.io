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

var phys, engine;

let fno = 1;
let spd = 1;

async function render() {
	if (fno % spd == 0) {
		if (fno % (100 * spd) == 0) {
			let box = new phys.PhysObject({ x: 120, y: 25, fy: 0.1, fx: 0.1, vy: 3 });
			let p1  = new phys.PhysPoint({ x: -25, y: -25 });
			let p2  = new phys.PhysPoint({ x: -25, y:  25 });
			let p3  = new phys.PhysPoint({ x:  25, y:  25 });
			let p4  = new phys.PhysPoint({ x:  25, y: -25 });
			p1.friends.push(p2);
			p2.friends.push(p3);
			p3.friends.push(p4);
			p4.friends.push(p1);
			box.points.push(p1, p2, p3, p4);
			engine.world.children.push(box);
			engine.objects.push(box);
			box.parent = engine.world;
		}
	
		engine.context.clearRect(0, 0, 10000, 1000);
		engine.exec();
		engine.draw();
	}

	fno++;	
	
	requestAnimationFrame(render);
}

async function main() {
	phys = await import("./phys/phys.js");
	
	engine = new phys.PhysEngine({
		viewport: document.getElementById("vp")
	});

	let br = engine.viewport.getBoundingClientRect();
	engine.viewport.height = br.height;
	engine.viewport.width  = br.width;
	
	let floor = new phys.PhysObject({ x: 0, y: 200, fy: 10000, fx: 10000, s: 1 });
	let floor_1 = new phys.PhysPoint({ x: 0,    y: 0  });
	let floor_2 = new phys.PhysPoint({ x: 0,    y: 10 });
	let floor_3 = new phys.PhysPoint({ x: 1000, y: 10 });
	let floor_4 = new phys.PhysPoint({ x: 1000, y: 0  });
	floor_1.friends.push(floor_2);
	floor_2.friends.push(floor_3);
	floor_3.friends.push(floor_4);
	floor_4.friends.push(floor_1);
	floor.points.push(floor_1, floor_2, floor_3, floor_4);
	engine.world.children.push(floor);
	engine.objects.push(floor);
	floor.parent = engine.world;
	
	let box = new phys.PhysObject({ x: 120, y: 160, fy: 0.1, fx: 0.1, vr: Math.PI / 360 });
	box.points.push(
		new phys.PhysPoint({ x: -20, y: -25 }),
		new phys.PhysPoint({ x: -30, y:  25 }),
		new phys.PhysPoint({ x:  20, y:  25 }),
		new phys.PhysPoint({ x:  30, y: -25 })
	);
	engine.world.children.push(box);
	engine.objects.push(box);
	box.parent = engine.world;

	let box2 = new phys.PhysObject({ x: 130, y: 10, fy: 0.1, fx: 0.1 });
	box2.points.push(
		new phys.PhysPoint({ x: -25, y: -25 }),
		new phys.PhysPoint({ x: -25, y:  25 }),
		new phys.PhysPoint({ x:  25, y:  25 }),
		new phys.PhysPoint({ x:  25, y: -25 })
	);
	// engine.world.children.push(box2);
	// engine.objects.push(box2);
	
	let obstacle = new phys.PhysObject({ x: 90, y: 200, fy: 10000, fx: 10000, s: 1 });
	let obstacle_1 = new phys.PhysPoint({ x: -10, y: -25 });
	let obstacle_2 = new phys.PhysPoint({ x: -10, y: -1  });
	let obstacle_3 = new phys.PhysPoint({ x:  10, y: -1  });
	let obstacle_4 = new phys.PhysPoint({ x:  10, y: -25 });
	obstacle_1.friends.push(obstacle_2);
	obstacle_2.friends.push(obstacle_3);
	obstacle_3.friends.push(obstacle_4);
	obstacle_4.friends.push(obstacle_1);
	obstacle.points.push(obstacle_1, obstacle_2, obstacle_3, obstacle_4);
	// engine.world.children.push(obstacle);
	// engine.objects.push(obstacle);
	// obstacle.parent = engine.world;
	
//	box.gx = 0;
	box.vy = 4;
	
	requestAnimationFrame(render)
}

main();
