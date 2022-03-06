function forward_event(t, e) {
	t.dispatchEvent(new e.__proto__.constructor(e.type, e));
}

async function main() {
	let { NetEngineThing } = await import("./thing/netengine.js");
	
	let vp = document.getElementById("bg_viewport");
	let nb = document.getElementsByClassName("not_bg")[0];
	
	let engine = new NetEngineThing(vp, {
	  walls: {
	    top: {
	      mode: "SOLID"
	    },
	    right: {
	      mode: "SOLID"
	    },
	    left: {
	      mode: "SOLID"
	    },
	    bottom: {
	      mode: "SOLID"
	    }
	  },
	  palete: {
	    bg:    0x101010,
	    nodef: 0x303030
	  }
	});

	engine.step(false);

	for (let i = 0; i < 100; i++) {
		engine.add_node({
		  fx: 0.1,
		  fy: 0.1,
		  r:  10,
		  x:  Math.random() * engine.width,
		  y:  Math.random() * engine.height
		});
	}

	for (let i = 0; i < engine.nodes.length; i++) {
		let n1 = engine.nodes[i];
		for (let i = 0; i < engine.nodes.length; i++) {
			let n2 = engine.nodes[i];
			if (n1 === n2) continue;
			if (Math.floor(Math.random() * engine.nodes.length * 1.2) == 0) {
				engine.add_link({
					n1: n1,
					n2: n2,
					nl: Math.random() * 500,
					st: Math.random() * 10
				});
			}
		}
	}
	
	engine.step(true);

	nb.addEventListener("mousedown", forward_event.bind(this, vp));
	nb.addEventListener("mousemove", forward_event.bind(this, vp));
	nb.addEventListener("mouseup",   forward_event.bind(this, vp));
	
	console.log(engine);
}

main();
