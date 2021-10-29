import {MintgateVerifier} from 'mintgate-verifier';

export function verifyOwnerShip(){
    

    const mv = new MintgateVerifier();

    mv.providers('app');

    mv.checkLink();

    const check = async ()=>{
        try{
            //await connect();
            console.log(`hello world 1111 -> 777`);
        }
        catch(err){
            console.log(err);
        }
    }

    check();

}

