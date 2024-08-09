import axios from "axios";
import { useEffect, useState } from "react";
import {
    PlaylistsContainer,
    PlaylistCard,
    PlaylistTitle,
    PlaylistImage
}from '../../styles/styleComponents/UserPlaylistDeezer.styles'


type Playlist = {
    id:number;
    title:string;
    picture:string;
}

function UserPlaylistDeezer(){
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading,setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const fetchPlaylists = async () => {
          const accessToken = localStorage.getItem('deezerAccessToken');
          const expiresAt = localStorage.getItem('deezerTokenExpiresAt');
    
          if (accessToken) {
            if (expiresAt) {
              const currentTime = Date.now();
              if (currentTime >= parseInt(expiresAt)) {
                console.log('Access token expired');
                localStorage.removeItem('deezerAccessToken');
                localStorage.removeItem('deezerTokenExpiresAt');
                setError('Session expired. Please log in again.');
                return;
              }
            }
            
            try {
              const response = await axios.get('https://api.deezer.com/user/me/playlists', {
                params: { access_token: accessToken },
              });
              console.log('API response:', response.data);
              const playlistData = response.data.data;
              if (Array.isArray(playlistData)) {
                setPlaylists(playlistData);
              } else {
                console.error('Unexpected response format:', response.data);
                setError('Unexpected response format');
              }
            } catch (err: unknown) {
              if (axios.isAxiosError(err)) {
                const message = err.response?.data?.error?.message || err.message;
                console.error('Error fetching playlists:', message);
                if (message === 'An active access token must be used to query information about the current user') {
                  localStorage.removeItem('deezerAccessToken');
                  localStorage.removeItem('deezerTokenExpiresAt');
                  setError('Session expired. Please log in again.');
                } else {
                  setError(message);
                }
              } else {
                console.error('Error fetching playlists:', err);
                setError('An unknown error occurred');
              }
            } finally {
              setLoading(false);
            }
          } else {
            console.error('No access token found in localStorage');
            setError('No access token found. Please log in.');
          }
        };
    
        fetchPlaylists();
      }, []);

    if(loading) return <div>Loading playlist....</div>
    if (error) return <div>Error: {error}</div>;

    return (
        <PlaylistsContainer>
            {playlists?.map(playlist => (
                <PlaylistCard key={playlist.id}>
                <PlaylistImage src={playlist.picture} alt={playlist.title} />
                <PlaylistTitle>{playlist.title}</PlaylistTitle>
              </PlaylistCard>
            ))}
        </PlaylistsContainer>

    )


}
export default UserPlaylistDeezer