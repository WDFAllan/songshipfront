import IndexDeezer from "./Deezer/IndexDeezer";
import IndexSpotify from "./Spotify/IndexSpotify";
import '../styles/css/MainPage.css'
import SongShip from "../images/SongShip.png";

function Mainpage(){


    return(
        <div className="Main">
            <header>
                <img className="titleImg" src={SongShip}/>
            </header>
            <div className="splits">
                <IndexDeezer/>
                <IndexSpotify/>
            </div>
        </div>
    )

}
export default Mainpage;