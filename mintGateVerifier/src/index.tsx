import { Web3WalletConnector, CONNECT_EVENT, ERROR_EVENT } from "@mindsorg/web3modal-ts";
import Web3 from "web3";
import { h, render } from 'preact';
import './styles.css';

import Torus from "@toruslabs/torus-embed";
import Authereum from "authereum";

import { fetchJsonAsync } from './utils';
import App, {TokenProps} from './app';

const providerOptions = {
    /* See Provider Options Section */
    authereum: {
        package: Authereum
    },
    torus: {
        package: Torus
    },

};

//https://chainlist.org/


export class MintgateVerifier {



    public readonly token: TokenProps = undefined;

    constructor(divId: string) {

        const rootDiv = document.getElementById(divId);

        if (!rootDiv) {
            console.debug(`div id ${divId} NOT found`);
            return;
        }

        const mintTokenId = rootDiv.getAttribute('tid');

        if (!mintTokenId) {
            console.error(`divId ${divId} is missing attribute tid`);
            return;
        }

        const nounce = rootDiv.getAttribute('nounce');

        if (!nounce) {
            console.error(`divId ${divId} is missing attribute nounce`);
            return;
        }

        this.token = { divId, mintTokenId, nounce };

    }

    async checkLink() {
        try {


            const done = await fetchJsonAsync<{ status: string }>(fetch('https://mgate.io/api/v2/links/linkid?id=2U0eV_BjlIh6'));

            console.log((await done).status);


        } catch (error) {
            debugger;
            console.error(error);
        }

    }


    load(styleName?: string) {

        if (!this.token) {
            console.error(`token is not defined`);
            return;
        }


        const rootDiv = document?.getElementById(this.token.divId);

        if (!rootDiv) {
            console.error(`div id ${this.token?.divId} NOT found`);
            return;
        }

        render(<div className={styleName || 'w3ProviderList'}>
            <App {...this.token} />
        </div>, rootDiv);

    }

}
