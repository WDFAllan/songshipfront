import { useEffect, useState } from "react";
import LoginButton from "./LoginButton";
import UserProfile from "./UserInfo";

function IndexDeezer(){

    const [isLoggedIn,setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('deezerAccessToken');
        const expiresAt = localStorage.getItem('deezerTokenExpiresAt');

        if (token && expiresAt) {
            const currentTime = Date.now();
            if (currentTime < parseInt(expiresAt)) {
              setIsLoggedIn(true);
            } else {
              // Token expiré, on clear le token stocké 
              localStorage.removeItem('deezerAccessToken');
              localStorage.removeItem('deezerTokenExpiresAt');
            }
        }
    }, []);

    return( 
        <div className="container">
            {isLoggedIn ? <UserProfile /> : <LoginButton />}
        </div>
    )

}

export default IndexDeezer;
