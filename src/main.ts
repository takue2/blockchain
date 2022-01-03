import express from "express";
import bodyParser from "body-parser";
import {BlockChain} from "./blockChain";
import axios from "axios";
import { URL } from "url";

const app = express();
const port = process.env.PORT || "3210";
const nodeIdentifier = `waiyade${port}`;

const blockChain = new BlockChain(port);

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const server = app.listen(port, async function(){
    console.log(`Node.js is listening to PORT: ${process.env.PORT}`);
    await axios.post("http://localhost:3210/node/register", {
        nodes: Array.from(blockChain.nodes)
    })
});

// AdminWeb
app.get("/adminWeb", (req,res) => {
    res.send(200);
})

// テスト用　initialize
app.get("/initialize", async (req,res) => {
    await axios.post("http://localhost:3210/node/register", {
        nodes: Array.from(blockChain.nodes)
    })
    res.send(200);
})

// ルートでインスタンスの情報を全て取得
app.get("/", (req,res) => {
    res.json({
        ...blockChain,
        nodes: Array.from(blockChain.nodes)
    })
})

// chainでブロックチェーン部分を取得
app.get("/chain", (req, res) => {
    res.json(blockChain.chain);
});

// 新規トランザクションに追加
// トランザクションは次に生成されるブロックでまとめて記録される（あってる？）
app.post("/transaction/new", async (req, res) => {
    await blockChain.resolveChainConflicts();
    type Body = {
        sender: string;
        recipient: string;
        amount: number;
        timestamp: Date;
    }
    const body:Body = req.body;
    const transaction = blockChain.addNewTransaction(
        body.sender, body.recipient, body.amount
    );

    // transactionが新規に登録されたものの場合各ノードに配布する
    if (!transaction.duplicated) {
        blockChain.nodes.forEach(async node => {
            await axios.post(`${node}/transaction/new`, body).then(res => {
                console.log(`try to add transaction to ${node}: ${res.status}`)
            });
        })
    }
    res.json({
        message: `${transaction.number}番目のブロックのtransactionに追加されました`,
        transactionID: transaction.transaction.transactionID
    })
})

// マイニング
// 一時トランザクションを記録したブロックを追加する
app.get("/mine", async (req, res) => {
    await blockChain.resolveChainConflicts();
    const lastBlock = blockChain.getLastBlock();
    const lastProof = lastBlock.proof;
    const proof = blockChain.pow(lastProof);
    blockChain.addNewTransaction(
        "new",
        nodeIdentifier,
        1
    )
    const block = blockChain.addNewBlock(proof)

    res.json({
        message: "新しいブロックを採掘しました",
        ...block
    })
});

// 新規ノードのURLを追加する
app.post("/node/register", async (req, res) => {
    type Body = {
        nodes: string[];
    };
    const body:Body = req.body;
    // 未接続のノードを登録する
    Promise.all(body.nodes.map(async node => {
        const url = new URL(node);

        if (!blockChain.nodes.has(url.origin)) {
            return await blockChain.registerNode(url.origin);
        }
    })).then(
        // 未接続のノードが存在する場合はそのノードに登録リクエストを投げる
        (nodeSetList) => {
            nodeSetList.forEach(async (nodeSet, idx) => {
                if (nodeSet) {
                    const url = new URL(body.nodes[idx]);
                    console.log(`unknown node: ${url.origin}`)
                    await blockChain.registerNode(url.origin);
                    await axios.post(`${url.origin}/node/register`, {
                        nodes: Array.from(blockChain.nodes)
                    });
                }
            })
        }
    );
    res.json({
        nodes: Array.from(blockChain.nodes)
    });
});

// 全ノードのブロックをなめて、最も長いノードを己のブロックとする
app.get("/node/resolve", async (req, res) => {
    await blockChain.resolveChainConflicts();
    res.json({
        message: ":conflict: :pien:",
        currentChain: blockChain.chain
    })
})
