import '@g-js-api/g.js';
await $.exportConfig({
	type: "live_editor",
	options: { info: true, reencrypt: false }
});

let particle = group(9);
let particlec = color(10);
let palette = [[200, 255, 200], [160, 200, 80], [0, 64, 0], [16, 16, 16]].reverse();
let colors = palette.map(x => {
	let c = unknown_c();
	c.set(x);
	return c;
})
let resolution = 160 * 144;
let sprite_tiles = Array(256 * 8).fill(0).map(_ => float_counter());
let bg_tiles = Array(256 * 8).fill(0).map(_ => counter());
let temp_tile = Array(64).fill(0).map(_ => counter());

let spriteN = 0;
let tiles = [
	[3, 3, 3, 3, 1, 2, 1, 0],
	[3, 3, 3, 3, 1, 3, 2, 0],
	[0, 1, 2, 3, 2, 2, 2, 0],
	[0, 2, 3, 1, 1, 1, 3, 0],
	[2, 3, 1, 0, 0, 0, 1, 0],
	[3, 3, 0, 0, 2, 2, 2, 0],
	[3, 3, 0, 0, 1, 3, 3, 0],
	[1, 3, 2, 0, 0, 3, 3, 0]
]
let emst = Array(256 * 8).fill(0);
let emrt = Array(64).fill(0);

function tileTerminal(r, g, b) {
    // Ensure RGB values are within the valid range (0-255)
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
        console.error("RGB values must be between 0 and 255.");
        return;
    }

    // ANSI escape code for background color with RGB
    const ansiCode = `\x1b[48;2;${r};${g};${b}m`;
    
    // Print a single background ANSI character (a space, in this case)
    return ansiCode + '  ' + '\x1b[0m'; // Reset the color after printing
}

tiles.forEach(row => {
	console.log(row.map(x => tileTerminal(...palette[x])).join(''));
});

let tiles_to_items = trigger_function(_ => {
	tiles.forEach((row, i) => {
		let rowvals = row.map((x, i) => {
			let mult = 4 ** (row.length - 1 - i);
			return x * mult;
		}).reduce((a, b) => a + b);
		// console.log(row, rowvals)
		sprite_tiles[(spriteN * 8) + i].set(rowvals);
		temp_tile[i].reset();
		emst[(spriteN * 8) + i] = rowvals;
	});
});

function extractTiles() {
	for (let row = 0; row < 8; row++) {
		let number = sprite_tiles[row];
		let divisor = counter(4 ** 7); // Equivalent to shifting left but using powers of 4
		let tdiv = 4 ** 7;
		
		for (let i = 0; i < 8; i++) {
			let nc = float_counter().set(number);
			// let value = Math.floor(number / divisor) % 4; // Extracts the two-bit value
			nc.divide(divisor).floor();
			console.log(nc);
			
			// modulo
			let temp = float_counter().set(nc);
			
			nc.divide(4);
			
			nc.floor();
			
			nc.multiply(4);
			
			$.add(item_edit(temp.item, nc.item, nc.item, TIMER, TIMER, TIMER, EQ, SUB).with(obj_props.Y, 75));
			

			let nnc = Math.floor(emst[row] / tdiv) % 4;
			// console.log(nnc - (4 * Math.floor(nnc / 4)));

			temp_tile[(row * 8) + i].set(nc);
			
			
			divisor.divide(4);
			tdiv /= 4;
			
		}
	}
}

let [ ox, oy ] = [ 75, 75 ];
let mul = 0.25;
temp_tile.map((x, i) => {
	let px = i % 8;
	let py = 7 - Math.floor(i / 8);

	x.to_obj().with(obj_props.X, (px * 30 * mul) + ox).with(obj_props.Y, (py * 30 * mul) + oy).with(obj_props.SCALING, mul).add();
})
sprite_tiles.slice(0, 8).map((x, i) => {
	x.display((i * 30) + ox + 140, oy)
})

wait(0.5);
tiles_to_items.call();
wait(0.5);
extractTiles();
wait(0.5);
// tile draw
for (let x = 0; x < 8; x++) {
	for (let y = 0; y < 8; y++) {
		let go = unknown_g();
		object({
			OBJ_ID: 211,
			GROUPS: go,
			X: (x * 15 * mul) + 45,
			Y: (y * 15 * mul) - 75,
			SCALING: mul
		}).add();
		// go.alpha(0);
		temp_tile[((7 - y) * 8) + x].to_const(range(0, 4), (val) => {
			// particlec.set(palette[val]);
			ignore_context_change(_ => go.pulse(palette[val], 0, 9999));
		})
		// wait(0.01);
		// spawn_particle(particle, go);
	}
}