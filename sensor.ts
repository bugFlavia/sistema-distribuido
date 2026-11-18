class Sensor {
    id: number;
    nome: string;
    tipo: string;
    min: number;
    max: number;
    valor: number;

    constructor(id: number, nome: string, tipo: string, min: number, max: number, valor: number) {
        this.id = id;
        this.nome = nome;
        this.tipo = tipo;
        this.min = min;
        this.max = max;
        this.valor = valor;
    }

    lerValor(): number {
        this.valor = Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;
        return this.valor;
    }
}

export { Sensor };