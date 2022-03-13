import { ReadStream } from 'fs';

// https://stackoverflow.com/questions/10623798/how-do-i-read-the-contents-of-a-node-js-stream-into-a-string-variable
export function streamToString (stream: ReadStream) : Promise<string> {
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
