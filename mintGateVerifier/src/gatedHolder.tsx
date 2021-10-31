import { h, FunctionComponent, Fragment } from 'preact';

import { FontAwesomeIcon } from '@aduh95/preact-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

import { useState } from 'preact/hooks';


const Holder: FunctionComponent<{
    address:string,
    onSignOut:()=>Promise<void>
}> = ({children, address, onSignOut})=>{

    const [showMenu, setshowMenu] = useState<boolean>(false);

    return  <div className="ne-gated-holder">
    {children}
    <div className={'ne-gated-lock ' + (showMenu ? 'ne-gated-lock-open' : 'ne-gated-lock-closed')}>
        <button className="anchor-btn"
            onClick={() => {
                setshowMenu(!showMenu);
            }}
        >
        </button>
        {showMenu && <div className="ne-gated-lock-menu">
            <div className="ethAddress">Address: {address}</div>

            <div>
                <button onClick={() => onSignOut()}>
                    <span><FontAwesomeIcon icon={faSignOutAlt} /> <small>Sign out of wallet</small></span>
                </button>
            </div>
        </div>
        }

    </div>
</div>;
}

export default Holder;