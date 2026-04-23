import { useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

function CallbackSpotify() {
    const location = useLocation();

    useEffect(() => {
        const fetchAccessToken = async () => {
            const searchParams = new URLSearchParams(location.search);
            const code = searchParams.get('code');

            if (code) {
                const clientId = process.env.REACT_APP_SPOTIFY_ID;
                const clientSecret = process.env.REACT_APP_SPOTIFY_SECRET;
                const credentials = btoa(`${clientId}:${clientSecret}`);

                try {
                    const response = await axios.post(
                        '/spotify-oauth/api/token',
                        new URLSearchParams({
                            grant_type: 'authorization_code',
                            code: code,
                            redirect_uri: 'http://127.0.0.1:3000/callbackSpotify',
                        }),
                        {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'Authorization': `Basic ${credentials}`,
                            },
                        }
                    );

                    const { access_token, refresh_token, expires_in } = response.data;
                    if (access_token) {
                        const params = new URLSearchParams();
                        params.set('spotify_access_token', access_token);
                        if (refresh_token) params.set('spotify_refresh_token', refresh_token);
                        if (expires_in) params.set('spotify_expires_at', (Date.now() + expires_in * 1000).toString());

                        // Redirige vers localhost avec le token dans le hash (cross-origin localStorage)
                        window.location.href = `http://localhost:3000#${params.toString()}`;
                    }
                } catch (error) {
                    console.error('Error fetching Spotify access token:', error);
                }
            }
        };

        fetchAccessToken();
    }, [location]);

    return <div>Loading...</div>;
}

export default CallbackSpotify;