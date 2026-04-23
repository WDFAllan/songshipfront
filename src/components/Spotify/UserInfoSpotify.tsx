import { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/css/UserInfo.css'

function UserInfoSpotify() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const accessToken = localStorage.getItem('spotifyAccessToken');
            if (accessToken) {
                try {
                    const response = await axios.get('/spotify-api/v1/me', {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    setUser(response.data);
                } catch (error) {
                    console.error('Error fetching Spotify user profile:', error);
                }
            }
        };
        fetchUserProfile();
    }, []);

    if (!user) return <div>Loading...</div>;

    return (
        <div className='profile'>
            Spotify account, {user.display_name}
        </div>
    );
}

export default UserInfoSpotify;
