import IndexDeezer from "./Deezer/IndexDeezer";
import IndexSpotify from "./Spotify/IndexSpotify";

function Mainpage(){


    return(
        <div className="Main">
            <div className="split Deezer">
                <IndexDeezer/>
            </div>
            <div className="split Spotify">
                <IndexSpotify/>
            </div>
        </div>
    )

}
export default Mainpage;