import express from 'express';
//import {ecsign,toRpcSig,fromRpcSig,ecrecover,pubToAddress, sha256FromString} from 'ethereumjs-util';
import * as util from "ethereumjs-util";

import Web3 from 'web3';
const web3 = new Web3();

const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

const port = 3300;

app.listen(port, () => {
    console.log(`Running on port ${port}.`);
});

app.post('/check', async (req, res) => {
    
    const data: {
        signed: string;
        nounce: string;
    } = req.body;
    try {


        if (!(data?.nounce && data?.signed)) {
            throw new Error('nounce or signed is empty');
        }


        let nonce = "\x19Ethereum Signed Message:\n" + data.nounce.length + data.nounce;
        let nonceB = util.keccak(Buffer.from(nonce, "utf-8"))


        //const signature = '0x77d80a3604b1a33b3c06987cdd237e9227846b536f29f69583ae8b4b266be2185002a6f88d37dc7827320a5d26fc39fb980be62ac3967dc2d39dabcae61e31911c';
        const { v, r, s } = util.fromRpcSig(data.signed)
        const pubKey = util.ecrecover(util.toBuffer(nonceB), v, r, s)
        const addrBuf = util.pubToAddress(pubKey)
        const address = util.bufferToHex(addrBuf)

        res.json({ address });
    }
    catch (err) {
        console.log(`check failed req = ${data}, err = ${err}`);
        res.sendStatus(500).send(err.toString());
    }

});