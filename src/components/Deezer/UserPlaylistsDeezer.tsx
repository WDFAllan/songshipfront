import axios from "axios";
import { useEffect, useState } from "react";
import Tracks from './Track';
import {
    PlaylistsContainer,
    PlaylistCard,
    PlaylistTitle,
    PlaylistImage
} from '../../styles/styleComponents/UserPlaylistDeezer.styles'


type Playlist = {
    id: number;
    title: string;
    picture: string;
}

type Track = {
    id: number;
    title: string;
    artist: { name: string };
    album: { cover: string };
}

function UserPlaylistDeezer() {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [transferStatus, setTransferStatus] = useState<string | null>(null);
    const [transferring, setTransferring] = useState(false);
    const [notFoundTracks, setNotFoundTracks] = useState<Track[]>([]);

    const deezerToken = localStorage.getItem('deezerAccessToken');
    const spotifyToken = localStorage.getItem('spotifyAccessToken');

    const [playlistsRefresh, setPlaylistsRefresh] = useState(0);

    useEffect(() => {
        const handler = () => setPlaylistsRefresh(n => n + 1);
        window.addEventListener('deezer-playlist-created', handler);
        return () => window.removeEventListener('deezer-playlist-created', handler);
    }, []);

    useEffect(() => {
        const fetchPlaylists = async () => {
            const expiresAt = localStorage.getItem('deezerTokenExpiresAt');
            if (!deezerToken) {
                setError('Aucun token trouvé. Veuillez vous connecter.');
                setLoading(false);
                return;
            }
            if (expiresAt && Date.now() >= parseInt(expiresAt)) {
                localStorage.removeItem('deezerAccessToken');
                localStorage.removeItem('deezerTokenExpiresAt');
                setError('Session expirée. Veuillez vous reconnecter.');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get('/deezer-api/user/me/playlists', {
                    params: { access_token: deezerToken },
                });
                const playlistData = response.data.data;
                if (Array.isArray(playlistData)) {
                    setPlaylists(playlistData);
                } else {
                    setError('Format de réponse inattendu');
                }
            } catch (err: unknown) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.error?.message || err.message);
                } else {
                    setError('Une erreur inconnue est survenue');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylists();
    }, [playlistsRefresh]);

    async function handlePlaylistClick(playlist: Playlist) {
        setSelectedPlaylist(playlist);
        setTracks([]);
        setTransferStatus(null);
        setNotFoundTracks([]);
        setLoading(true);
        try {
            const allTracks = await getTracks(playlist.id, deezerToken!);
            setTracks(allTracks);
        } catch {
            setError('Impossible de charger les tracks');
        } finally {
            setLoading(false);
        }
    }

    async function getTracks(playlistId: number, accessToken: string, index = 0, accumulated: Track[] = []): Promise<Track[]> {
        const response = await axios.get(`/deezer-api/playlist/${playlistId}/tracks`, {
            params: { access_token: accessToken, index, limit: 25 },
        });
        const trackData = response.data.data;
        if (trackData.length === 0) return accumulated;
        return getTracks(playlistId, accessToken, index + trackData.length, [...accumulated, ...trackData]);
    }

    async function handleTransferToSpotify() {
        const currentSpotifyToken = localStorage.getItem('spotifyAccessToken');
        if (!selectedPlaylist || !currentSpotifyToken) return;
        setTransferring(true);
        setTransferStatus('Transfert en cours...');
        setNotFoundTracks([]);

        const spotifyHeaders = { Authorization: `Bearer ${currentSpotifyToken}` };
        let found = 0;
        const uris: string[] = [];
        const missing: Track[] = [];

        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];
            setTransferStatus(`Recherche des titres... ${i + 1}/${tracks.length}`);
            try {
                const q = `track:${track.title} artist:${track.artist.name}`;
                const res = await axios.get('/spotify-api/v1/search', {
                    headers: spotifyHeaders,
                    params: { q, type: 'track', limit: 1 },
                });
                const items = res.data.tracks?.items;
                if (items?.length > 0) {
                    uris.push(items[0].uri);
                    found++;
                } else {
                    missing.push(track);
                }
            } catch {
                missing.push(track);
            }
        }

        if (uris.length === 0) {
            setTransferStatus('Aucun titre trouvé sur Spotify.');
            setTransferring(false);
            return;
        }

        try {
            setTransferStatus('Création de la playlist sur Spotify...');
            const createRes = await axios.post(
                '/spotify-api/v1/me/playlists',
                { name: selectedPlaylist.title, description: '', public: false },
                { headers: { ...spotifyHeaders, 'Content-Type': 'application/json' } }
            );
            const newPlaylistId = createRes.data.id;

            // Spotify accepte max 100 URIs par requête
            for (let i = 0; i < uris.length; i += 100) {
                const batch = uris.slice(i, i + 100);
                await axios.post(
                    `/spotify-api/v1/playlists/${newPlaylistId}/items`,
                    { uris: batch },
                    { headers: { ...spotifyHeaders, 'Content-Type': 'application/json' } }
                );
            }

            setTransferStatus(`✓ ${found}/${tracks.length} titres transférés vers Spotify`);
            setNotFoundTracks(missing);
            window.dispatchEvent(new Event('spotify-playlist-created'));
        } catch (err) {
            console.error('Error creating Spotify playlist:', err);
            setTransferStatus('Erreur lors de la création de la playlist sur Spotify.');
        } finally {
            setTransferring(false);
        }
    }

    if (loading && playlists.length === 0) return <div></div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <PlaylistsContainer>
                {playlists.map(playlist => (
                    <PlaylistCard
                        key={playlist.id}
                        onClick={() => handlePlaylistClick(playlist)}
                        style={{ cursor: 'pointer', border: selectedPlaylist?.id === playlist.id ? '2px solid rgb(162, 56, 255)' : undefined }}
                    >
                        <PlaylistImage src={playlist.picture} alt={playlist.title} />
                        <PlaylistTitle>{playlist.title}</PlaylistTitle>
                    </PlaylistCard>
                ))}
            </PlaylistsContainer>

            {selectedPlaylist && (
                <div style={{ marginLeft: '20px' }}>
                    <button
                        onClick={handleTransferToSpotify}
                        disabled={!spotifyToken || transferring}
                        style={{
                            marginBottom: '10px',
                            padding: '8px 16px',
                            background: spotifyToken ? 'rgb(30, 215, 96)' : '#ccc',
                            color: spotifyToken ? '#000' : '#888',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: spotifyToken ? 'pointer' : 'not-allowed',
                            fontWeight: 'bold',
                        }}
                    >
                        {transferring ? transferStatus : 'Transférer vers Spotify →'}
                    </button>
                    {!spotifyToken && <span style={{ color: '#888', fontSize: '12px', marginLeft: '8px' }}>Connectez-vous à Spotify d'abord</span>}
                    {!transferring && transferStatus && (
                        <div style={{ color: 'rgb(162, 56, 255)', fontSize: '13px', marginBottom: '8px' }}>{transferStatus}</div>
                    )}
                    {!transferring && notFoundTracks.length > 0 && (
                        <details style={{ marginTop: '6px' }}>
                            <summary style={{ cursor: 'pointer', fontSize: '13px', color: '#888' }}>
                                {notFoundTracks.length} titre{notFoundTracks.length > 1 ? 's' : ''} non trouvé{notFoundTracks.length > 1 ? 's' : ''} sur Spotify
                            </summary>
                            <ul style={{ margin: '6px 0 0 0', padding: '0 0 0 16px', fontSize: '12px', color: '#aaa' }}>
                                {notFoundTracks.map(t => (
                                    <li key={t.id}>{t.title} — {t.artist.name}</li>
                                ))}
                            </ul>
                        </details>
                    )}
                </div>
            )}

            <Tracks tracks={tracks} />
        </div>
    )
}

export default UserPlaylistDeezer;
