import { Web3WalletConnector, CONNECT_EVENT, ERROR_EVENT } from "@mindsorg/web3modal-ts";
import Web3 from "web3";
import { h, FunctionComponent, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import './styles.css';


import Torus from "@toruslabs/torus-embed";
import Authereum from "authereum";

import Holder from './gatedHolder';

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
    postId: string;

} | undefined;

type Web3withAddress = {
    web3?: Web3;
    address?: string;
}

type WPContent ={
    content?:string;
    needsAccess?:boolean;
}


const App: FunctionComponent<TokenProps> = ({ mintTokenId, postId }) => {

    const [web3Async, setWeb3] = useState<IAsyncResult<Web3withAddress>>();
    const [contentAsync, setContent] = useState<IAsyncResult<WPContent>>();

    const [nounce, setNounce] = useState<string>();

    const puchaseUrl =`https://www.mintgate.app/t/${mintTokenId}`;

    const fetchContent = async () => {

        try {
            setContent({ isLoading: true });

            const done = await fetchJsonAsync<{
                status?: string,
                error?: string,
                content?: string,
                address?: string,
                nounce?: string
            }>(
                fetch(`/?rest_route=/ne-mintgate/v1/content/${encodeURIComponent(postId)}`));

            if (!done?.address) {
                console.log('no address sent from session');
            }

            if(done?.nounce){
                setNounce(done.nounce)
            }

            if (done?.address && (done?.address != web3Async?.result?.address)) {
                setWeb3({ result: { address: done.address } });
            }

            if (!!done?.error) {
                throw new Error(done.error);
            }

            if (!!done?.content) {
                setContent({ result: {content:done.content} });
            } else {

                if(done?.status =='noaccess'){
                    setContent({ result: {needsAccess:true} });
                }else{
                    //if we don't have the content it's ok
                    setContent({});
                }

            }


        } catch (error) {
            setContent({ error: error as Error });
        }

    };


    useEffect(() => {

        if (web3Async && !web3Async.result) {
            setContent(undefined);
            return;
        } else {
            console.log('no web3 loading from session wallet')
        }


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

            if(!nounce){
                throw new Error('no nonce initialized');
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

            setWeb3({ result: { web3, address: done?.address } });

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

    const onSignOut = async ()=>{
        try {
            setContent(undefined);
            setWeb3(undefined);
            const done = await fetchStringAsync(
                fetch(`/?rest_route=/ne-mintgate/v1/signout`));
        } catch (err) {
            console.error(`failed to sign out ${err}`);
        }
        finally {
            setWeb3({});
        }
    }

    const ToShow = () => {
        if (contentAsync?.result?.content) {

            return <Holder address={web3Async?.result?.address||''}
                {...{onSignOut}}
            >
                <div dangerouslySetInnerHTML={{ __html: contentAsync.result.content }} />
            </Holder>;
        }

        if (contentAsync?.result?.needsAccess) {

            return <Holder address={web3Async?.result?.address||''}
                {...{onSignOut}}
            >
                <div>
                    <h4>This content is locked using Mintgate</h4>

                    <p>Click <a href={puchaseUrl} target="_blank">here</a> to get access</p>

                    <p><small><a class="secondary" href="#" onClick={e=>{
                        e.preventDefault();
                        fetchContent();
                    }} >
                        click here to refresh after getting access
                    </a></small></p>
                </div>
            </Holder>;
        }

        if (web3Async?.result) {
            return <Holder address={web3Async?.result?.address||''}
                {...{onSignOut}}
            >
                <div></div>
            </Holder>;
            
        }

        return <Fragment>
            <div className="thePrompt">
                <p>This content is <strong>reserved for subscribers</strong><br />
                    To gain access please choose your wallet</p>
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

    return <Fragment>
        <ToShow />
        {web3Async?.error && <ShowError error={web3Async?.error} />}
        {contentAsync?.error && <ShowError error={contentAsync?.error} />}
    </Fragment>;

};

export default App;