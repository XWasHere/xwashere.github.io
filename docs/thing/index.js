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

// MY MASTERPIECE
class NetEngineThing {
  viewport;
  context;

  height = 100;
  width  = 100;

  nodes = [];
  links = [];

  walls = {
    top: { mode: "PUSH" },
    left: { mode: "PUSH" },
    right: { mode: "PUSH" },
    bottom: { mode: "PUSH" }
  };

  palete = {
    bg:    0xffffffff,
    nodef: 0x00000000
  };

  debug = 0;

  constructor(viewport, args) {
    this.viewport = viewport;
    this.context  = viewport.getContext("2d");

    this.height = args?.height || viewport.clientHeight || this.height;
    this.width  = args?.width  || viewport.clientWidth  || this.width;
    this.debug  = args?.debug  || this.debug;
    this.walls  = args?.walls  || this.walls;
    this.palete = args?.palete || this.palete;
  }

  phys() {
    for (let i = 0; i < this.links.length; i++) {
      let ln = this.links[i];
      let n1 = ln.n1;
      let n2 = ln.n2;

      // leftovers from my algorithm. keeping it because it looks cool
      if (Math.sqrt(n1.x**2 + n1.y**2) < Math.sqrt(n2.x**2 + n2.y**2)) {
        n1 = ln.n2;
        n2 = ln.n1;	
      }

      n1.color = 0xFF0000;
      n2.color = 0x00FF00;

      let d = Math.sqrt(((n2.y - n1.y) ** 2) + ((n2.x - n1.x) ** 2));

      if      (d < ln.nl) ln.color = 0xFF0000
      else if (d > ln.nl) ln.color = 0x0000FF
      else                ln.color = 0x00FF00;

      // algorighm from d3-force. i tried doing it myself but eventually i caved and started searching online for a solution
      let tx  = n2.x + n2.vx - n1.x - n1.vx;
      let ty  = n2.y + n2.vy - n1.y - n1.vy;
      let tl  = Math.sqrt(tx**2 + ty**2);
          tl  = (tl - ln.nl) / tl * 0.001 * ln.st;
          tx *= tl;
          ty *= tl;
      n2. vx -= tx;
      n2. vy -= ty;
      n1. vx += tx; 
      n1. vy += ty;

    }

    for (let i = 0; i < this.nodes.length; i++) {
      let n1 = this.nodes[i];
      let pb = 1, pr = 1, pt = 1, pl = 1;

      // clip with nodes
      for (let i = 0; i < this.nodes.length; i++) {
        let n2 = this.nodes[i];

        if (n1 === n2) break;

        if (Math.hypot(n1.x - n2.x, n1.y - n2.y) <= n1.r + n2.r + 1) {
          let force = (Math.hypot(n1.x - n2.x, n1.y - n2.y) / (n1.r + n2.r) + 1) //* ((n1.b + n2.b) / 2);

          if (n1.x + n1.r < n2.x + n2.r && n1.x > 0) {
            n1.vx -= n1.fx + force / 2;
            n2.vx += n2.fx + force / 2;
          } else {
            n1.vx += n1.fx + force / 2;
            n2.vx -= n2.fx + force / 2;
          }

          if (n1.y + n1.r < n2.y + n2.r && n1.y) {
            n1.vy -= n1.fy + force / 2;
            n2.vy += n2.fy + force / 2;
          } else {
            n1.vy += n1.fy + force / 2;
            n2.vy -= n2.fy + force / 2;
          }

        }
      }

      // clip with walls
      if (n1.x - n1.r <= 0) {
        if (this.walls.left.mode == "PUSH") {
          if (n1.x - n1.r < 0) {
            n1.vx += n1.fx + Math.abs(n1.x) / n1.r + 1;
          }
        } else if (this.walls.left.mode == "SOLID") {
          n1.x = n1.r;
          if (n1.vx < 0) n1.vx = 0;

          pl = 0;
        }
      }
      if (n1.x + n1.r > this.width) {
        if (this.walls.right.mode == "PUSH") {
          n1.vx -= n1.fx + Math.abs(this.width - n1.x) / n1.r + 1;
        } else if (this.walls.right.mode == "SOLID") {
          n1.x = this.width - n1.r;
          if (n1.vx > 0) n1.vx = 0;

          pr = 0;
        }
      }
      if (n1.y - n1.r <= 0) {
        if (this.walls.top.mode == "PUSH") {
          if (n1.y - n1.r < 0) {
            n1.vy += n1.fy + Math.abs(n1.y) / n1.r + 1;
          }
        } else if (this.walls.top.mode == "SOLID") {
          n1.y = n1.r;
          if (n1.vy < 0) n1.vy = 0;

          pt = 0;
        }
      }
      if (n1.y + n1.r > this.height) {
        if (this.walls.bottom.mode == "PUSH") {
          n1.vy -= n1.fy + Math.abs(this.height - n1.y) / n1.r + 1;
        } else if (this.walls.bottom.mode == "SOLID") {
          n1.y = this.height - n1.r;
          if (n1.vy > 0) n1.vy = 0;

          pb = 0;
        }
      }

      // acceleration 
      n1.vx += n1.ax;
      n1.vy += n1.ay;

      // gravity
      if (n1.gx < 0 && pl || n1.gx > 0 && pr) {
        n1.vx += n1.gx;
      }
      if (n1.gy < 0 && pt || n1.gy > 0 && pb) {
        n1.vy += n1.gy;
      }

      // friction
      if (n1.vx > 0) {
        n1.vx -= n1.fx;
        if (n1.vx < 0) n1.vx = 0;
      } else if (n1.vx < 0) {
        n1.vx += n1.fx;
        if (n1.vx > 0) n1.vx = 0;
      }
      if (n1.vy > 0 && n1.fya != -999) {
        n1.vy -= n1.fy;
        if (n1.vy < 0) n1.vy = 0;
      } else if (n1.vy < 0) {
        n1.vy += n1.fy;
        if (n1.vy > 0) n1.vy = 0;
      }

      // motion 
      n1.x += n1.vx;
      n1.y += n1.vy;
    }
  }

  render() {
    this.width  = this.viewport.width  = this.viewport.clientWidth;
    this.height = this.viewport.height = this.viewport.clientHeight;

    this.context.strokeStyle = this.constructor.css_hex(this.palete.bg);
    this.context.fillRect(0, 0, this.width, this.height);
    this.context.strokeStyle = "#000000";

    for (let i = 0; i < this.nodes.length; i++) {
      let node = this.nodes[i];

      this.context.beginPath();
      this.context.strokeStyle = this.constructor.css_hex(node.color);
      this.context.arc(node.x, node.y, node.r, 0, 2 * Math.PI);
      this.context.stroke();
      this.context.fillStyle = this.constructor.css_hex(this.palete.nodef);
      this.context.fill();
    }

    this.context.strokeStyle = "#000000";

    for (let i = 0; i < this.links.length; i++) {
      let link = this.links[i];

      this.context.beginPath();
      this.context.moveTo(link.n1.x, link.n1.y);
      this.context.strokeStyle = this.constructor.css_hex(link.color);
      this.context.lineTo(link.n2.x, link.n2.y);
      this.context.stroke();
    }

    this.context.strokeStyle = "#000000";
  }

  step(cnt) {
    this.phys();
    this.render();

    if (cnt) {
      requestAnimationFrame(() => {
        this.step(true);
      });
    }
  }

  static css_hex(v) { return `#${v.toString(16).padStart(6, '0')}`; }
}

let eng = new NetEngineThing(document.getElementById("viewport"), {
  debug: 0,
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

eng.step(false);

for (let i = 0; i < 100; i++) {
  eng.nodes.push({
    ax:    0,
    ay:    0,
    fx:    0.1,
    fy:    0.1,
    vx:    0,
    vy:    0,
    gx:    0,
    gy:    0,
    b:     0,
    x:     Math.random() * eng.width,
    y:     Math.random() * eng.height,
    r:     10,
    color: 0x000000,
    links: []
  });
}

for (let i = 0; i < eng.nodes.length; i++) {
  let n1 = eng.nodes[i];

  for (let i = 0; i < eng.nodes.length; i++) {
    let n2 = eng.nodes[i];

    // dont increase too much or the universe will collapse
    if (Math.floor(Math.random() * eng.nodes.length) == 0) {
      let l = {
        n1: n1,
        n2: n2,
        nl: Math.random() * 500,
        st: Math.random() * 10
      }

      n1.links.push(l);
      n2.links.push(l);
      eng.links.push(l);
    }
  }
}

eng.step(true);

console.log(eng);
