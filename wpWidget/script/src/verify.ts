import {MintgateVerifier} from 'mintgate-verifier';

export function verifyOwnerShip(){
    
    const mv = new MintgateVerifier('mint-gated');

    if(!mv.token){
        return;
    }

    mv.load();

}

