import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/css/UserInfo.css'

function Userinfo() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
        const accessToken = localStorage.getItem('deezerAccessToken');

        if (accessToken) {
            try {
            const response = await axios.get('https://api.deezer.com/user/me', {
                params: { access_token: accessToken },
            });
            setUser(response.data);
            } catch (error) {
            console.error('Error fetching user profile:', error);
            }
        }
        };

        fetchUserProfile();
    }, []);

    if (!user) return <div>Loading...</div>;

    return (
        <div className='profile'>
            Deezer account, {user.name}
        </div>
    );
};

export default Userinfo;