import express from "express";
import bodyParser from "body-parser";
import {BlockChain} from "./blockChain";

const app = express();
const port = process.env.PORT || 3000;
const nodeIdentifier = `waiyade${port}`;

const blockChain = new BlockChain();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const server = app.listen(port, function(){
    console.log(`Node.js is listening to PORT: ${process.env.PORT}`);
});

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
        node: string;
    };
    const body:Body = req.body;
    await blockChain.registerNode(body.node)
    res.json({
        message: "ノードを追加しました",
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
