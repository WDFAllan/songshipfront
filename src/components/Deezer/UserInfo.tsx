import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserProfile: React.FC = () => {
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
        <div>
        <h1>Welcome, {user.name}</h1>
        <p>Email: {user.email}</p>
        </div>
    );
};

export default UserProfile;