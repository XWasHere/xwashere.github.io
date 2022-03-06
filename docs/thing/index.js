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

async function main() {
  let { NetEngineThing } = await import("./netengine.js");
  
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
      s:     0,
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
}

main();
