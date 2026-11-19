import type { Buffer } from 'node:buffer';
import * as net from 'node:net';
import {Conexao, type Mensagem, type MediaSensor, receber} from './protocolo.ts';

const porta:number = 3000;
const servico: string = 'localhost';
const portaServico: number = 3001;
const portaCliente: number = 3002;

const medias: Mensagem[] = [];

const conexaoServico = new Conexao(servico, portaServico)
conexaoServico.conectar((mensagem: Mensagem) => {
    medias.push(mensagem);
});

const server: net.Server = net.createServer((socket: net.Socket) => {

    socket.on('data', (dados: Buffer) => {
        for (const linha of dados.toString().split('\n')) {
            if (!linha) continue;
            const mensagemRecebida: Mensagem = receber(linha);
            console.log(`Mensagem recebida: ${JSON.stringify(mensagemRecebida)}`);
            console.log(`Encaminhando mensagem para o serviço em ${servico}:${portaServico}`);
            conexaoServico.enviar(mensagemRecebida);
        }
    });

});

server.listen(porta, () => {
    console.log(`Servidor rodando na porta ${porta}`);
});

const serverCliente: net.Server = net.createServer((socket: net.Socket) => {
    console.log(`Cliente conectado: ${socket.remoteAddress}:${socket.remotePort}`);
    socket.end(JSON.stringify(medias) + '\n');
});

serverCliente.listen(portaCliente, () => {
    console.log(`Servidor de clientes rodando na porta ${portaCliente}`);
});