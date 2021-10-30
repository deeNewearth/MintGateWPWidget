import { Web3WalletConnector, CONNECT_EVENT, ERROR_EVENT } from "@mindsorg/web3modal-ts";
import Web3 from "web3";
import { h, FunctionComponent, Fragment } from 'preact';
import { useState } from 'preact/hooks';
import './styles.css';


import Torus from "@toruslabs/torus-embed";
import Authereum from "authereum";



import { fetchJsonAsync, IAsyncResult, ShowError, Spinner } from './utils';

const providerOptions = {
    /* See Provider Options Section */
    authereum: {
        package: Authereum
    },
    torus: {
        package: Torus
    },

};

export type TokenProps = {
    divId: string;
    mintTokenId: string;
    nounce: string;
} | undefined;


const App: FunctionComponent<TokenProps> = ({ nounce }) => {

    const [web3Async, setWeb3] = useState<IAsyncResult<Web3>>();

    const web3Modal = new Web3WalletConnector({
        network: "mainnet", // optional

        cacheProvider: false, // optional
        providerOptions, // required
        disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });

    web3Modal.providerController.on(CONNECT_EVENT, async p => {
        debugger;


        try {

            setWeb3({ isLoading: true });
            /*
            const done = await p.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x3" }]
            });
        */

            const web3 = new Web3(p);

            const myAccounts = await web3.eth.getAccounts();

            if (!myAccounts?.length) {
                throw new Error('no wallet found');
            }

            console.log(`wallet address = ${myAccounts[0]}`);
            const signed = await web3.eth.personal.sign(nounce, myAccounts[0], '');

            const done = await fetchJsonAsync<{ status: string }>(
                fetch('/?rest_route=/ne-mintgate/v1/wallet', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ signed })
                }));


            throw new Error('to be done');


            setWeb3({ result: web3 });


        } catch (error) {
            setWeb3({ error: error as Error });
        }


    });

    web3Modal.providerController.on(ERROR_EVENT, p => {
        debugger;

        const h = p;
        console.log(h);
    });

    if (web3Async?.isLoading) {
        return <Spinner />;
    }

    return <Fragment>
        <div className="thePrompt">
            <p>This content is <strong>reserved for subscribers only using Mintgate</strong></p>
            <p>To gain access or purchase please choose your wallet</p>
        </div>
        <div className="theList">
            {web3Modal.providers.map(pr => <div className="w3Provider" key={pr.name} >
                <button onClick={async () => {
                    try {
                        setWeb3({ isLoading: true });
                        await pr.onClick();
                    }
                    catch (error) {
                        setWeb3({ error: error as Error });
                    }
                }}>
                    <img className="pLogo" src={pr.logo?.toString()} alt={pr.name} />
                    <div>{pr.name}</div>
                </button>
            </div>)

            }
        </div>
        {web3Async?.error && <ShowError error={web3Async?.error} />}
    </Fragment>;

};

export default App;