import { useEffect, useState } from "react";
import LoginButton from "./LoginButton";
import Userinfo from "./UserInfo";
import '../../styles/css/Index.css'
import UserPlaylistDeezer from "./UserPlaylistsDeezer";
import DeezerLogo from "../../images/DeezerLogo.png";

function IndexDeezer(){

    const [isLoggedIn,setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('deezerAccessToken');
        const expiresAt = localStorage.getItem('deezerTokenExpiresAt');

        if (token) {
            if(expiresAt){
                const currentTime = Date.now();

                if (currentTime < parseInt(expiresAt)) {
                    setIsLoggedIn(true);
                } else {
                    // // Token expiré, on clear le token stocké 
                    localStorage.removeItem('deezerAccessToken');
                    localStorage.removeItem('deezerTokenExpiresAt');
                }
            }setIsLoggedIn(true);
            
        }
    }, []);

    return(
            <div className="split Deezer">
                
                {isLoggedIn ?
                    <div className="userInfo">
                        <Userinfo /> 
                    </div>
                : 
                    <div className="deezerLoginButton">
                        <img className="deezerLogo" src={DeezerLogo}/>
                        <LoginButton />
                    </div>
                }
                <div className="DeezerPlaylist">
                    <UserPlaylistDeezer/>
                </div>
            </div>  
    )

}

export default IndexDeezer;
