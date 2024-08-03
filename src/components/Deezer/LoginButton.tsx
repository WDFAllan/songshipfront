import '../../styles/LoginButton.css'

function LoginButton(){
    const handleLogin = () =>{
        const connexionPath = process.env.REACT_APP_API_DEEZER_PATH;
        const appId = process.env.REACT_APP_DEEZER_APP_ID;
        const url = connexionPath + "app_id="+ appId +"&redirect_uri=http://localhost:3000/callback&perms=basic_access,manage_library";
        window.location.href = url;
    }

    return  <button className="button-9" role="button" onClick={handleLogin}>
                Login
            </button>
}

export default LoginButton;