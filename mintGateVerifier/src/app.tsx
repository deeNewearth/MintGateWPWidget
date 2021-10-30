import { Web3WalletConnector, CONNECT_EVENT, ERROR_EVENT } from "@mindsorg/web3modal-ts";
import Web3 from "web3";
import { h, FunctionComponent, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import './styles.css';


import Torus from "@toruslabs/torus-embed";
import Authereum from "authereum";

import { fetchJsonAsync, IAsyncResult, ShowError, Spinner, fetchStringAsync } from './utils';

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
    postId: string;
    verifiedAddress?: string;
} | undefined;


const App: FunctionComponent<TokenProps> = ({ nounce, mintTokenId, postId, verifiedAddress }) => {

    const [web3Async, setWeb3] = useState<IAsyncResult<Web3>>();
    const [contentAsync, setContent] = useState<IAsyncResult<string>>();

    const [showMenu, setshowMenu] = useState<boolean>(false);

    useEffect(() => {

        if (!verifiedAddress && !web3Async?.result) {
            setContent(undefined);
            return;
        }

        const fetchContent = async () => {

            try {
                setContent({ isLoading: true });

                const done = await fetchJsonAsync<{ status?: string, error?: string, content?: string }>(
                    fetch(`/?rest_route=/ne-mintgate/v1/content/${encodeURIComponent(postId)}`));

                if (!!done?.error) {
                    throw new Error(done.error);
                }

                setContent({ result: done.content });

            } catch (error) {
                setContent({ error: error as Error });
            }

        };

        fetchContent();

    }, [web3Async?.result]);

    const web3Modal = new Web3WalletConnector({
        network: "mainnet", // optional

        cacheProvider: false, // optional
        providerOptions, // required
        disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });

    web3Modal.providerController.on(CONNECT_EVENT, async p => {

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

            const done = await fetchJsonAsync<{ status?: string, error?: string, address?: string }>(
                fetch('/?rest_route=/ne-mintgate/v1/wallet', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ signed })
                }));

            if (!!done?.error) {
                throw new Error(done.error);
            }

            if (myAccounts[0].toLowerCase() != done?.address?.toLowerCase()) {
                throw new Error('The verified address does not match');
            }

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
        return <Spinner prompt="waiting for wallet..." />;
    }

    if (contentAsync?.isLoading) {
        return <Spinner prompt="waiting for content..." />;
    }




    return <Fragment>
        {contentAsync?.result ? <div className="ne-gated-holder">
            <div dangerouslySetInnerHTML={{ __html: contentAsync.result }} />
            <div className={'ne-gated-lock ' +(showMenu?'ne-gated-lock-open':'ne-gated-lock-closed') }>
                <button
                    onClick={() => {
                        setshowMenu(!showMenu);
                    }}
                >
                </button>
                {showMenu && <div className="ne-gated-lock-menu">
                    <div>Hello1</div>
                    <div>Hello2</div>
                    <div>Hello3</div>
                </div>
                }

            </div>
        </div> : <Fragment>
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
        </Fragment>
        }
        {web3Async?.error && <ShowError error={web3Async?.error} />}
        {contentAsync?.error && <ShowError error={contentAsync?.error} />}
    </Fragment>;

};

export default App;