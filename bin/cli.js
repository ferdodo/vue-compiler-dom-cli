#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = require("yargs");
const helpers_1 = require("yargs/helpers");
const compiler_dom_1 = require("@vue/compiler-dom");
const stream_to_string_1 = require("./utils/stream-to-string");
const fs_1 = require("fs");
async function main() {
    const args = (0, helpers_1.hideBin)(process.argv);
    const options = await (0, yargs_1.default)(args)
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
    const inputStream = (0, fs_1.createReadStream)(options.infile);
    const outputStream = (0, fs_1.createWriteStream)(options.outfile);
    const template = await (0, stream_to_string_1.streamToString)(inputStream);
    const isCustomElement = await isCustomElementFn(options);
    const compilerOptions = { isCustomElement };
    const codeGen = (0, compiler_dom_1.compile)(template, compilerOptions);
    const code = codeGen.code;
    outputStream.write(code);
    outputStream.close();
}
function isCustomElementFn(options) {
    if (options.customElementRegexp) {
        const re = new RegExp(options.customElementRegexp);
        return (tag) => re.test(tag);
    }
    else {
        return () => false;
    }
}
main()
    .then(() => process.exit(0))
    .catch(function (error) {
    console.error(error);
    process.exit(-1);
});
