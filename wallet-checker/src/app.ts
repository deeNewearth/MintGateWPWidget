import express from 'express';
//import {ecsign,toRpcSig,fromRpcSig,ecrecover,pubToAddress, sha256FromString} from 'ethereumjs-util';
import * as util from "ethereumjs-util";

import Web3  from 'web3';
const web3 = new Web3();

const app = express();
const port = 3300;

app.listen(port, () => {
  console.log(`Running on port ${port}.`);
});

app.get('/check',async (req,res)=>{
    debugger;
    try{

        let nonce = 'test'; 
        nonce = "\x19Ethereum Signed Message:\n" + nonce.length + nonce;
        let nonceB = util.keccak(Buffer.from(nonce, "utf-8"))


        const signature = '0x77d80a3604b1a33b3c06987cdd237e9227846b536f29f69583ae8b4b266be2185002a6f88d37dc7827320a5d26fc39fb980be62ac3967dc2d39dabcae61e31911c';
        const { v, r, s } = util.fromRpcSig(signature)
        const pubKey = util.ecrecover(util.toBuffer(nonceB), v, r, s)
        const addrBuf = util.pubToAddress(pubKey)
        const addr = util.bufferToHex(addrBuf)

        const messageHash = web3.utils.sha3('test');
        //var messageHashx = Buffer.from(messageHash.replace("0x", ""), "hex")


        const messageHash1 = '0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658';
        //const messageHashx = Buffer.from(messageHash.replace("0x", ""), "hex");
        const messageHashx = Buffer.from(messageHash, "hex");

        /*
        const signedMessage = ecsign(messageHashx, pKeyx);
        const signedHash_u = toRpcSig(signedMessage.v, signedMessage.r, signedMessage.s); //.toString("hex");
        console.log(`signedHash_u ->${signedHash_u}`);
*/

/*
        // Shared Message
        const signedHash = '0x0e358389161d72558bbd27c6103269a4a0153d4823ad0b7f09ed2f66f6b0c9c21bb47417d3d8a4f20092ab1a1949393f137343908d9d137662b4a7c358727b791c';
        const sigDecoded = fromRpcSig(signedHash);

        
        const publicKey = ecrecover(messageHash, sigDecoded.v, sigDecoded.r, sigDecoded.s);

        
        const recoveredPub = ecrecover(messageHashx, sigDecoded.v, sigDecoded.r, sigDecoded.s);

        const recoveredAddress = pubToAddress(recoveredPub).toString("hex");

        console.log(`recoveredAddress -> ${recoveredAddress}`);
*/
    }
    catch(err){
        debugger;
        res.sendStatus(500);
    }

});