import SpotifyLogo from "../../images/SpotifyLogo.png";
import LoginButtonSpotify from "./LoginButtonSpotify";
import '../../styles/css/Index.css'

function IndexSpotify(){

    return(
        <div className="split Spotify">       
            <div className="deezerLoginButton">
                <img className="deezerLogo" src={SpotifyLogo}/>
                {<LoginButtonSpotify/>}
            </div>
        </div>
    )

}
export default IndexSpotify;