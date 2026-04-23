import { useEffect, useState } from "react";
import SpotifyLogo from "../../images/SpotifyLogo.png";
import LoginButtonSpotify from "./LoginButtonSpotify";
import UserInfoSpotify from "./UserInfoSpotify";
import UserPlaylistsSpotify from "./UserPlaylistsSpotify";
import '../../styles/css/IndexSpotify.css'

function IndexSpotify() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Récupère le token Spotify passé dans le hash après le callback cross-origin
        const hash = window.location.hash.substring(1);
        if (hash) {
            const params = new URLSearchParams(hash);
            const spotifyToken = params.get('spotify_access_token');
            if (spotifyToken) {
                localStorage.setItem('spotifyAccessToken', spotifyToken);
                const refreshToken = params.get('spotify_refresh_token');
                if (refreshToken) localStorage.setItem('spotifyRefreshToken', refreshToken);
                const expiresAt = params.get('spotify_expires_at');
                if (expiresAt) localStorage.setItem('spotifyTokenExpiresAt', expiresAt);
                window.history.replaceState(null, '', '/');
                setIsLoggedIn(true);
                return;
            }
        }

        const token = localStorage.getItem('spotifyAccessToken');
        const expiresAt = localStorage.getItem('spotifyTokenExpiresAt');

        if (token) {
            if (expiresAt) {
                const currentTime = Date.now();
                if (currentTime < parseInt(expiresAt)) {
                    setIsLoggedIn(true);
                } else {
                    localStorage.removeItem('spotifyAccessToken');
                    localStorage.removeItem('spotifyRefreshToken');
                    localStorage.removeItem('spotifyTokenExpiresAt');
                }
            } else {
                setIsLoggedIn(true);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('spotifyAccessToken');
        localStorage.removeItem('spotifyRefreshToken');
        localStorage.removeItem('spotifyTokenExpiresAt');
        setIsLoggedIn(false);
    };

    return (
        <div className="split Spotify">
            {isLoggedIn ?
                <>
                    <div className="userInfo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginRight: '15px' }}>
                        <UserInfoSpotify />
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '4px 10px',
                                fontSize: '12px',
                                background: 'transparent',
                                color: '#888',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Déconnexion
                        </button>
                    </div>
                    <div className="DeezerPlaylist">
                        <UserPlaylistsSpotify />
                    </div>
                </>
            :
                <div className="deezerLoginButton">
                    <img className="deezerLogo" src={SpotifyLogo} />
                    <LoginButtonSpotify />
                </div>
            }
        </div>
    )
}

export default IndexSpotify;
