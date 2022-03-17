#!/usr/bin/env node
import { transpile } from "./main";

transpile()
	.catch(function(error: Error){
		console.error(error);
		process.exit(-1);
	});
