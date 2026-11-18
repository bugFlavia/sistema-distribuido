import type { Buffer } from 'node:buffer';
import * as net from 'node:net';
import {sensor} from './sensor.ts';

const porta:number = 3000;
const server: net.Server = net.createServer((socket: net.Socket) => {
    socket.write(`${socket.remoteAddress}:${socket.remotePort}`);

    socket.on('data', (mensagem: Buffer) => {
        console.log(mensagem.toString('utf8'));
    });

    socket.on('close', () =>  {
        console.log(`Conexão encerrada: ${socket.remoteAddress}:${socket.remotePort}`);
    });


});

server.listen(porta, () => {
    console.log(`Servidor rodando na porta ${porta}`);
});