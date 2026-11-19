import { Sensor } from "./sensor.ts";
class Talhao {
    id: number;
    nome: string;
    sensores: Sensor[];

    constructor(id: number, nome: string, sensores: Sensor[]) {
        this.id = id;
        this.nome = nome;
        this.sensores = sensores;
    }
}

export {Talhao};