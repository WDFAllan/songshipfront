import { useEffect, useState } from "react";
import LoginButton from "./LoginButtonDeezer";
import Userinfo from "./UserInfo";
import '../../styles/css/IndexDeezer.css'
import UserPlaylistDeezer from "./UserPlaylistsDeezer";
import DeezerLogo from "../../images/DeezerLogo.png";

function IndexDeezer(){

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('deezerAccessToken');
        const expiresAt = localStorage.getItem('deezerTokenExpiresAt');

        if (token) {
            if (expiresAt) {
                const currentTime = Date.now();
                if (currentTime < parseInt(expiresAt)) {
                    setIsLoggedIn(true);
                } else {
                    localStorage.removeItem('deezerAccessToken');
                    localStorage.removeItem('deezerTokenExpiresAt');
                }
            } else {
                // Token sans expiration (permanent)
                setIsLoggedIn(true);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('deezerAccessToken');
        localStorage.removeItem('deezerTokenExpiresAt');
        setIsLoggedIn(false);
    };

    return(
        <div className="split Deezer">
            {isLoggedIn ?
                <div className="userInfo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginRight: '15px' }}>
                    <Userinfo />
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            background: 'transparent',
                            color: '#888',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Déconnexion
                    </button>
                </div>
            :
                <div className="deezerLoginButton">
                    <img className="deezerLogo" src={DeezerLogo}/>
                    <LoginButton />
                </div>
            }
            {isLoggedIn &&
                <div className="DeezerPlaylist">
                    <UserPlaylistDeezer/>
                </div>
            }
        </div>
    )

}

export default IndexDeezer;