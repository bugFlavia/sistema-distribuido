import type { Buffer } from 'node:buffer';
import * as net from 'node:net';
import {Conexao, type Mensagem, type MediaSensor} from './protocolo.ts';

const porta:number = 3000;
const servico: string = 'localhost';
const portaServico: number = 3001;
const conexaoServico = new Conexao(servico, portaServico)
conexaoServico.conectar();

const server: net.Server = net.createServer((socket: net.Socket) => {

    socket.on('data', (mensagem: Buffer) => {
        const mensagemRecebida: Mensagem = Conexao.receber(mensagem);
        console.log(`Mensagem recebida: ${JSON.stringify(mensagemRecebida)}`);
        console.log(`Encaminhando mensagem para o serviço em ${servico}:${portaServico}`);
        conexaoServico.enviar(mensagemRecebida);
    });

    socket.on('close', () =>  {
        console.log(`Conexão encerrada: ${socket.remoteAddress}:${socket.remotePort}`);
    });


});

server.listen(porta, () => {
    console.log(`Servidor rodando na porta ${porta}`);
});