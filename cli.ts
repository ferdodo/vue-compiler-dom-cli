#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { compile } from '@vue/compiler-dom';
import { streamToString } from './utils/stream-to-string';
import { CodegenResult, CompilerOptions } from '@vue/compiler-core';
import { createReadStream, createWriteStream, ReadStream, WriteStream } from 'fs';

type CliOptions = {
	infile: string,
	outfile: string,
	customElementRegexp: string | undefined
};

async function main () {
	const args: string[] = hideBin(process.argv);

	const options: CliOptions = await yargs(args)
		.usage("Compile vue templates to render functions.")
		.options({
			infile: {
				description: "Template file to be compiled.",
				type: "string",
				demandOption: true,
				requiresArg: true
			},
			outfile: {
				description: "Destination file.",
				type: "string",
				demandOption: true,
				requiresArg: true
			},
			'custom-element-regexp': {
				type: "string",
				description: "Regular expression to match custom elements."
			}
		})
		.parse();

	const inputStream: ReadStream = createReadStream(options.infile);
	const outputStream: WriteStream = createWriteStream(options.outfile);
	const template: string = await streamToString(inputStream);
	const isCustomElement: CompilerOptions["isCustomElement"] = await isCustomElementFn(options);
	const compilerOptions: CompilerOptions = { isCustomElement };
	const codeGen: CodegenResult = compile(template, compilerOptions);
	const code: string = codeGen.code;
	outputStream.write(code);
	outputStream.close();
}

function isCustomElementFn (options: CliOptions) : CompilerOptions["isCustomElement"] {
	if (options.customElementRegexp) {
		const re: RegExp = new RegExp(options.customElementRegexp);
		return (tag: string) => re.test(tag);
	} else {
		return () => false;
	}
}

main()
	.then(() => process.exit(0))
	.catch(function (error: Error) {
		console.error(error);
		process.exit(-1);
	});
