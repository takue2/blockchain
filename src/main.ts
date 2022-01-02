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
    console.log(`Specified port: ${process.env.PORT}`)
    console.log("Node.js is listening to PORT:" + server.address());
});

app.get("/", (req,res) => {
    res.json({
        ...blockChain,
        nodes: Array.from(blockChain.nodes)
    })
})

app.get("/chain", (req, res) => {
    res.json(blockChain.chain);
});

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
        message: `${block}番目のtransactionに追加されました`
    })
})

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

app.get("/node/resolve", async (req, res) => {
    await blockChain.resolveChainConflicts();
    res.json({
        message: ":conflict: :pien:",
        currentChain: blockChain.chain
    })
})
