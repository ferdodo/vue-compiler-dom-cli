import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { compile } from '@vue/compiler-dom';
import { CodegenResult, CompilerOptions } from '@vue/compiler-core';
import { createReadStream, createWriteStream, ReadStream, WriteStream } from 'fs';

export async function transpile () {
	const options: Options = await getOptions();
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

function isCustomElementFn (options: Options) : CompilerOptions["isCustomElement"] {
	if (options.customElementRegexp) {
		const re: RegExp = new RegExp(options.customElementRegexp);
		return (tag: string) => re.test(tag);
	} else {
		return () => false;
	}
}

type Options = {
	infile: string,
	outfile: string,
	customElementRegexp: string | undefined
};

function getOptions(): Promise<Options> {
	const args: string[] = hideBin(process.argv);

	return <Promise<Options>> yargs(args)
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
}

function streamToString (stream: ReadStream) : Promise<string> {
	const chunks: Buffer[] = [];

	return new Promise(function (resolve, reject) {
		stream.on('data', function (chunk: Buffer) {
			chunks.push(Buffer.from(chunk));
		});

		stream.on('error', (err: Error) => reject(err));

		stream.on('end', function () {
			const fileBuffer: Buffer = Buffer.concat(chunks);
			const file: string = fileBuffer.toString('utf8');
			resolve(file);
		});
	});
}
