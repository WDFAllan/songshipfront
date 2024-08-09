import axios from "axios";
import { useEffect, useState } from "react";
import Tracks from './Track'; 
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

type Track = {
  id: number;
  title: string;
  artist: {
    name: string;
  };
  album: {
    cover: string;
  };
}

function UserPlaylistDeezer(){
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);

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

    async function handlePlaylistClick(playlistId:number){
      setSelectedPlaylistId(playlistId);
      setLoading(true);
      setError(null);

      const accessToken = localStorage.getItem('deezerAccessToken');
      if (accessToken) {
        try {
          const allTracks = await getTracks(playlistId, accessToken); // Récupérer tous les titres
          setTracks(allTracks);
        } catch (err: unknown) {
          console.error('Error fetching tracks:', err);
          setError('Failed to load tracks');
        } finally {
          setLoading(false);
        }
      }
    }



    async function getTracks(playlistId:number,accessToken:string,index = 0, accumulatedTracks: Track[] = []):Promise<Track[]>{
      try {
        const response = await axios.get(`https://api.deezer.com/playlist/${playlistId}/tracks`, {
          params: {
            access_token: accessToken,
            index: index, // Début de la pagination
            limit: 25, // Nombre d'éléments par requête, 25 est la limite par défaut
          },
        });
    
        const trackData = response.data.data;
        const nextIndex = index + trackData.length;
    
        if (trackData.length === 0) {
          return accumulatedTracks; // Aucun titre supplémentaire, renvoyer les titres accumulés
        } else {
          return getTracks(playlistId, accessToken, nextIndex, [...accumulatedTracks, ...trackData]); // Continuer la pagination
        }
      } catch (err: unknown) {
        console.error('Error fetching tracks:', err);
        throw err;
      }
    }



    if(loading) return <div>Loading playlist....</div>
    if (error) return <div>Error: {error}</div>;

    return (
      <div>
        <PlaylistsContainer>
            {playlists?.map(playlist => (
                <PlaylistCard key={playlist.id} onClick={()=>handlePlaylistClick(playlist.id)}>
                <PlaylistImage src={playlist.picture} alt={playlist.title} />
                <PlaylistTitle>{playlist.title}</PlaylistTitle>
              </PlaylistCard>
            ))}
        </PlaylistsContainer>
        <Tracks tracks={tracks}/>
      </div>
    )


}
export default UserPlaylistDeezer