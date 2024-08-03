import { useEffect, useState } from "react";
import LoginButton from "./LoginButton";
import UserProfile from "./UserInfo";

function IndexDeezer(){

    const [isLoggedIn,setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('deezerAccessToken');
        if (token) {
          setIsLoggedIn(true);
        }
    }, []);

    return( 
        <div className="container">
            {isLoggedIn ? <UserProfile /> : <LoginButton />}
        </div>
    )

}

export default IndexDeezer;
