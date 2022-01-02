import { BlockChain } from "./blockChain";

// てすと　まだうごかない　ぴえん
describe("blockChain", () => {
    it("validateChain", () => {
        const mockChain = [
            {
                "index": 1,
                "timestamp": new Date(),
                "transactions": [],
                "proof": 0,
                "previousHash": ""
            }, {
                "index": 2,
                "timestamp": new Date(),
                "transactions": [],
                "proof": 1,
                "previousHash": "1130b2c7da1a89477cc04e4f314dc83d8eda645941a7ef7bdf0a59c3fe3e2d6f"
            }, {
                "index": 3,
                "timestamp": new Date(),
                "transactions": [{ "sender": "new", "recipient": "waiyade", "amount": 1 }],
                "proof": 7178,
                "previousHash": "d247b66bca97674c0a6af27af743dadb3867e995b55867ee89171f868625337e"
            }, {
                "index": 4,
                "timestamp": new Date(),
                "transactions": [{ "sender": "new", "recipient": "waiyade", "amount": 1 }],
                "proof": 170180,
                "previousHash": "607788d766e015178b017d386863bbb7ae6ac32f578b48bf6b6460a3d0ec8af1"
            }, {
                "index": 5,
                "timestamp": new Date(),
                "transactions": [{ "sender": "new", "recipient": "waiyade", "amount": 1 }],
                "proof": 19302,
                "previousHash": "67c0920cd71990be2e6a0209b3e4411d8157be6eb758d849f6c70a6f731b039f"
            }, {
                "index": 6,
                "timestamp": new Date(),
                "transactions": [{ "sender": "new", "recipient": "waiyade", "amount": 1 }],
                "proof": 45584,
                "previousHash": "11cbd319b044b7f835ecd46e994de7777ee0ca5d2a2f1aee847ccb2188ec2d7f"
            }, {
                "index": 7,
                "timestamp": new Date(),
                "transactions": [{ "sender": "new", "recipient": "waiyade", "amount": 1 }],
                "proof": 92195,
                "previousHash": "720725d3492228e400a6f9afabf4eaa80cd5114f0c6533244cb4fb00b93f5692"
            }
        ];
        expect(new BlockChain().validateChain(mockChain)).toEqual(true);
    })
})