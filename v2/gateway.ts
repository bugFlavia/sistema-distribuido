import type { Buffer } from 'node:buffer';
import * as net from 'node:net';
import {Conexao, enviar, type Mensagem, type MediaSensor, receber, type Pedido} from './protocolo.ts';

const porta:number = 3001;
const servico: string = 'localhost';
const portaServidorSensores: number = 3000;
const portaServico: number = 3002;
const portaCliente: number = 3003;

const medias: Mensagem[] = [];

const conexaoServico = new Conexao(servico, portaServico)
conexaoServico.conectar((mensagem: Mensagem) => {
    medias.push(mensagem);
});

const conexaoServivorSensores = new Conexao(servico, portaServidorSensores)
conexaoServivorSensores.conectar((mensagem: Mensagem) => {
    if(!('leituras' in mensagem)) return;
    console.log(`Mensagem recebida do servidor de sensores: ${JSON.stringify(mensagem)}`);
    console.log(`Encaminhando mensagem para o serviço em ${servico}:${portaServico}`);
    conexaoServico.enviar(mensagem);
});

setInterval(() => {
    const pedido: Pedido = {pedido: 'leituras'};
    console.log(`Enviando pedido de leituras para o servidor de sensores: ${JSON.stringify(pedido)}`);
    conexaoServivorSensores.enviar(pedido);
}, 5000);

const serverCliente: net.Server = net.createServer((socket: net.Socket) => {
    console.log(`Cliente conectado: ${socket.remoteAddress}:${socket.remotePort}`);
    socket.end(JSON.stringify(medias) + '\n');
});

serverCliente.listen(portaCliente, () => {
    console.log(`Servidor de clientes rodando na porta ${portaCliente}`);
});