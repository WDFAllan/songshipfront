
function LoginButton(){
    const url:string = "http://localhost:5031/api/deezer/login";
    
    return  <button>
                <a href ={url}/>
            </button>
}