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

const server = app.listen(port, function(){
    console.log(`Node.js is listening to PORT: ${process.env.PORT}`);
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
app.post("/transaction/new", (req, res) => {
    type Body = {
        sender: string;
        recipient: string;
        amount: number;
    }
    const body:Body = req.body;
    const block = blockChain.addNewTransaction(
        body.sender, body.recipient, body.amount
    );
    res.json({
        message: `${block}番目のブロックのtransactionに追加されました`
    })
})

// マイニング
// 一時トランザクションを記録したブロックを追加する
app.get("/mine", (req, res) => {
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
    // 未接続のノードが存在する場合はそのノードに登録リクエストを投げる
    Promise.all(body.nodes.map(async node => {
        const url = new URL(node);

        if (!blockChain.nodes.has(url.origin)) {
            return await blockChain.registerNode(url.origin);
        }
    })).then(
        // 未接続のノードから返却されたノードリスト
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
