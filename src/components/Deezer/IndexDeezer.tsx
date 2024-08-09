import { useEffect, useState } from "react";
import LoginButton from "./LoginButton";
import Userinfo from "./UserInfo";
import '../../styles/css/IndexDeezer.css'
import UserPlaylistDeezer from "./UserPlaylistsDeezer";

function IndexDeezer(){

    const [isLoggedIn,setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('deezerAccessToken');
        const expiresAt = localStorage.getItem('deezerTokenExpiresAt');

        if (token ) {
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
        <div>
            <div className="loginInfo">
                {isLoggedIn ? <Userinfo /> : <LoginButton />}
            </div>
            <div className="DeezerPlaylist">
                <UserPlaylistDeezer/>
            </div>
        </div>
    )

}

export default IndexDeezer;
