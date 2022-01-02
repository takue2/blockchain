import {createHash} from "crypto";
import { request } from "http";
import { URL } from "url";
import axios from "axios";

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

const exampleNodes = [
    new URL("http://localhost:3210/chain"),
    new URL("http://localhost:3211/chain")
]

export class BlockChain {
    constructor() {
        this.chain = [genesisBlock];
        this.currentTransactions = [];
        this.nodes = new Set(exampleNodes);
    }

    chain: Block[];
    currentTransactions: Transaction[];
    nodes: Set<URL>;

    // transaction
    addNewTransaction(sender: string, recipient: string, amount: number) {
        this.currentTransactions.push({
            sender,
            recipient,
            amount
        });
        return this.getLastBlock().index + 1;
    }

    // blockの生成と末尾ブロックの取得
    addNewBlock(proof: number, previousHash?: string) {
        const block = new Block(
            this.chain.length + 1,
            this.currentTransactions,
            proof,
            previousHash || this.hashBlock(this.chain.slice(-1)[0])
        );
        
        this.currentTransactions = [];
        this.chain.push(block);
        return block
    }

    getLastBlock() {
        return this.chain.slice(-1)[0];
    }

    hashBlock(block: Block) {
        const sortedValues = Object.keys(block).sort()
            .map(key => block[key as keyof Block]);
        return createHash("sha256")
            .update(JSON.stringify(sortedValues), "utf8").digest("hex");
    }

    // Proof of Work
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

    async registerNode(address: string) {
        const url = new URL(address);
        const res = await axios.get(url.href);
        if (res.status === 200) {
            this.nodes.add(url)
        }
        return this.nodes;
    }

    validateChain(chain: Block[]) {
        let isValid = true;

        chain.slice(0,-1).forEach(((block, idx) => {
            const next = chain[idx + 1];

            if (
                // hash check
                next.previousHash !== this.hashBlock(block)
            ) {
                console.log("hash check failed: ")
                console.log(idx)
                isValid = false;
            }
            if (
                // and pow check
                !this.validateProof(block.proof, next.proof)
            ) {
                console.log("pow check failed: ")
                console.log(idx)
                isValid = false;
            }
        }));

        return isValid;
    }

    async resolveChainConflicts() {
        const result = await Promise.all(Array.from(this.nodes).map(node => {
            return axios.get(node.href)
        })).then(resList => {
            let candidate = this.chain;
            let candidateLength = candidate.length;
            resList.forEach(res => {
                const chain: Block[] = res.data;
                console.log(chain.length)
                console.log(this.validateChain(chain))
                if (candidateLength < chain.length) {
                    if (this.validateChain(chain)){
                        candidate = chain;
                        candidateLength = chain.length
                    }
                }
            })
            this.chain = candidate;
            return candidate;
        })
        console.log(this.chain)
        return result;
    }
}