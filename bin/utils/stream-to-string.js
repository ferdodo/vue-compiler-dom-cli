"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamToString = void 0;
// https://stackoverflow.com/questions/10623798/how-do-i-read-the-contents-of-a-node-js-stream-into-a-string-variable
function streamToString(stream) {
    const chunks = [];
    return new Promise(function (resolve, reject) {
        stream.on('data', function (chunk) {
            chunks.push(Buffer.from(chunk));
        });
        stream.on('error', (err) => reject(err));
        stream.on('end', function () {
            const fileBuffer = Buffer.concat(chunks);
            const file = fileBuffer.toString('utf8');
            resolve(file);
        });
    });
}
exports.streamToString = streamToString;
