import {createHash} from "crypto";
import axios from "axios";

export class Block {
    constructor(
        index: number,
        transactions: {[key: string]: Transaction},
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
    transactions: {[key: string]: Transaction};
    proof: number;
    previousHash: string;
}

export type Transaction = {
    transactionID: string;
    sender: string;
    recipient: string;
    amount: number;
};

const genesisBlock = new Block(1,{},0,"");

export class BlockChain {
    constructor(port: string) {
        this.chain = [genesisBlock];
        this.currentTransactions = {};
        this.nodes = new Set([
            // 試験的に3210ポートをハブとしてP2Pに参加する
            `http://localhost:3210`,
            `http://localhost:32101`,
            `http://localhost:${port}`
        ]);
    }

    chain: Block[];
    currentTransactions: {[key: string]: Transaction};
    nodes: Set<string>;

    // transaction
    addNewTransaction(sender: string, recipient: string, amount: number) {
        const rawTransaction = {
            sender,
            recipient,
            amount
        };
        const transaction = {
            ...rawTransaction,
            transactionID: this.getHashObject({
                ...rawTransaction
            })
        }
        const duplicated = !!this.currentTransactions[transaction.transactionID];
        if (!duplicated) {
            this.currentTransactions[transaction.transactionID] = transaction;
        }
        return {
            duplicated,
            transaction: transaction,
            number: this.getLastBlock().index + 1
        };
    }

    // blockの生成と末尾ブロックの取得
    addNewBlock(proof: number, previousHash?: string) {
        const block = new Block(
            this.chain.length + 1,
            this.currentTransactions,
            proof,
            previousHash || this.getHashObject(this.chain.slice(-1)[0])
        );
        
        this.currentTransactions = {};
        this.chain.push(block);
        return block
    }

    getLastBlock() {
        return this.chain.slice(-1)[0];
    }

    getHashObject <T extends {}>(object: T) {
        const sortedValues = Object.keys(object).sort()
            .map(key => object[key as keyof T]);
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
        return hash.slice(0,5) === "00000";
    }

    async registerNode(origin: string) {
        const res = await axios.get(`${origin}/adminWeb`);
        if (res.status === 200) {
            if (!this.nodes.has(origin)) {
                this.nodes.add(origin)
            }
        }
        return this.nodes;
    }

    validateChain(chain: Block[]) {
        let isValid = true;

        chain.slice(0,-1).forEach(((block, idx) => {
            const next = chain[idx + 1];

            if (
                // hash check
                next.previousHash !== this.getHashObject(block)
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
        const result = await Promise.allSettled(
            Array.from(this.nodes).map(node => {
                return axios.get(`${node}/chain`)
            })
        ).then(resList => {
            let candidate = this.chain;
            let candidateLength = candidate.length;
            resList.forEach(res => {
                if (res.status === "fulfilled") {
                    const chain: Block[] = res.value.data;
                    if (candidateLength < chain.length) {
                        if (this.validateChain(chain)){
                            candidate = chain;
                            candidateLength = chain.length
                        }
                    }
                }
            })
            this.chain = candidate;
            return candidate;
        })
        return result;
    }
}