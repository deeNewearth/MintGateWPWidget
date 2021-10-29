import { Web3WalletConnector, CONNECT_EVENT, ERROR_EVENT } from "@mindsorg/web3modal-ts";
import Web3 from "web3";
import { h, render } from 'preact';
import './styles.css';

import Torus from "@toruslabs/torus-embed";
import Authereum from "authereum";

import { fetchJsonAsync } from './utils';

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

    readonly web3Modal = new Web3WalletConnector({
        network: "mainnet", // optional

        cacheProvider: false, // optional
        providerOptions, // required
        disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });

    constructor() {

        this.web3Modal.providerController.on(CONNECT_EVENT, async p => {
            debugger;


            try {

                /*
                const done = await p.request({
                  method: "wallet_switchEthereumChain",
                  params: [{ chainId: "0x3" }]
                });
            */

                const web3 = new Web3(p);

                const ju = await web3.eth.getAccounts();

                if(ju.length > 0){

                    console.log(`wallet address = ${ju[0]}`);

                    const toSign  = web3.utils.sha3('test');

                    console.log(`to Sign hash is  ${toSign}`);

                    const signed = await web3.eth.personal.sign('test',ju[0],'');

                    console.log(`signed dat is ${signed}`);

                }



            } catch (error) {
                const t5 = error;
                //console.error(error.message);
            }


        });

        this.web3Modal.providerController.on(ERROR_EVENT, p => {
            debugger;

            const h = p;
            console.log(h);
        });
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


    providers(divId: string, styleName?: string) {
        this.web3Modal.providers.map(p => p.name);

        const rootDiv = document.getElementById(divId);

        if (!rootDiv) {
            console.error(`div id ${divId} NOT found`);
            return;
        }

        const PApp = <div className={styleName || 'w3ProviderList'}>
            <div className="thePrompt">Choose your wallet</div>
            <div className="theList">
                {this.web3Modal.providers.map(pr => <div className="w3Provider" key={pr.name} >
                    <button onClick={async () => {
                        try {
                            await pr.onClick();
                        }
                        catch (err) {
                            const e = err;
                            debugger;
                            console.error(e);
                        }
                    }}>
                        <img className="pLogo" src={pr.logo?.toString()} alt={pr.name} />
                        <div>{pr.name}</div>
                    </button>
                </div>)

                }
            </div>
        </div>;

        render(PApp, rootDiv);

    }

}
