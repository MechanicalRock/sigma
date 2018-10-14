import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

const input = 'lib/index.ts';
const external = ['aws-sdk'];

const plugins = [
	typescript(),
	commonjs(),
	resolve(),
	terser({ sourcemap: true }),
	sourceMaps()
]

export default [
	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify 
	// `file` and `format` for each target)
	{
		input,
		external,
		output: [
			{ file: pkg.module, format: 'es', sourcemap: true }
		],
		plugins
	}, {
		input,
		external,
		output: [
			{ file: pkg.main, format: 'cjs', sourcemap: true },
		],
		plugins
	}
];
