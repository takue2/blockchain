import {createHash} from "crypto";

export class Block {
    constructor(
        index: number,
        transactions: Transaction[],
        proof: number,
        previousHash: string
    ) {
        this. index = index;
        this.timestamp = new Date();
        this.transactions = transactions;
        this.proof = proof;
        this.previousHash = previousHash;
    }
    index: number;
    timestamp: Date;
    transactions: any[];
    proof: number;
    previousHash: string;
}

export type Transaction = {
    sender: string;
    recipient: string;
    amount: number;
};

const genesisBlock: Block = {
    index: 1,
    timestamp: new Date(2022, 0, 2),
    transactions: [],
    proof: 0,
    previousHash: ""
};

export class BlockChain {
    constructor() {
        this.chain = [genesisBlock];
        this.currentTransactions = [];
        this.newBlock(1);
    }

    chain: Block[];
    currentTransactions: Transaction[];

    public init() {
        return this.chain;
    }

    newBlock(proof: number, previousHash?: string) {
        const block = new Block(
            this.chain.length + 1,
            this.currentTransactions,
            proof,
            previousHash || this.hash(this.chain.slice(-1)[0])
        );
        

        this.currentTransactions = [];
        this.chain.push(block);
        return block
    }

    lastBlock() {
        return this.chain.slice(-1)[0];
    }

    newTransaction(sender: string, recipient: string, amount: number) {
        this.currentTransactions.push({
            sender,
            recipient,
            amount
        });
        return this.lastBlock().index + 1;
    }

    hash(block: Block) {
        const sortedValues = Object.keys(block).sort()
            .map(key => block[key as keyof Block]);
        return createHash("sha256")
            .update(JSON.stringify(sortedValues), "utf8").digest("hex");
    }

    pow(lastProof: number) {
        let proof = 0;
        while (!this.validateProof(lastProof, proof)) {
            proof += 1;
        }
        return proof;
    }

    validateProof(lastProof: number, proof: number) {
        const hash = createHash("sha256")
            .update(JSON.stringify(`${lastProof}${proof}`), "utf8").digest("hex");
        return hash.slice(0,4) === "0000";
    }
}