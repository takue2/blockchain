import express from "express";
import bodyParser from "body-parser";
import {BlockChain} from "./blockchain";

const app = express();
const nodeIdentifier = "waiyade";

const blockChain = new BlockChain();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const server = app.listen(3000, function(){
    console.log("Node.js is listening to PORT:" + server.address());
});

app.get("/", (req, res) => {
    res.json("youkoso");
});

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
    const block = blockChain.newTransaction(
        body.sender, body.recipient, body.amount
    );
    res.json({
        message: `${block}番目のtransactionに追加されました`
    })
})

app.get("/mine", (req, res) => {
    const lastBlock = blockChain.lastBlock();
    const lastProof = lastBlock.proof;
    const proof = blockChain.pow(lastProof);
    blockChain.newTransaction(
        "new",
        nodeIdentifier,
        1
    )
    const block = blockChain.newBlock(proof)

    res.json({
        message: "新しいブロックを採掘しました",
        ...block
    })
});
