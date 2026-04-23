import '../../styles/css/LoginButton.css'

function LoginButtonSpotify() {
    const handleLogin = () => {
        const connexionPath = process.env.REACT_APP_API_SPOTIFY_PATH;
        const appId = process.env.REACT_APP_SPOTIFY_ID;
        const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public';
        const url = connexionPath + "response_type=code&client_id=" + appId + "&scope=" + encodeURIComponent(scope) + "&redirect_uri=http://127.0.0.1:3000/callbackSpotify&show_dialog=true";
        window.location.href = url;
    }

    return <button className="button-9 spotifyButton" role="button" onClick={handleLogin}>
        Login to Spotify
    </button>
}

export default LoginButtonSpotify;