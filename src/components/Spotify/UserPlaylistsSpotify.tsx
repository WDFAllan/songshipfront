import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
    PlaylistsContainer,
    PlaylistCard,
    PlaylistTitle,
    PlaylistImage,
} from '../../styles/styleComponents/UserPlaylistDeezer.styles';
import {
    TracksContainer,
    TrackCard,
    TrackImage,
    TrackInfo,
    TrackTitle,
    TrackArtist,
} from '../../styles/styleComponents/TrackDeezer.styles';

type SpotifyPlaylist = {
    id: string;
    name: string;
    images: { url: string }[];
};

type SpotifyTrack = {
    id: string;
    name: string;
    artists: { name: string }[];
    album: { images: { url: string }[] };
};

function UserPlaylistsSpotify() {
    const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
    const [playlistsLoading, setPlaylistsLoading] = useState(true);
    const [playlistsError, setPlaylistsError] = useState<string | null>(null);

    const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
    const [tracksLoading, setTracksLoading] = useState(false);
    const [tracksError, setTracksError] = useState<string | null>(null);

    const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null);
    const [transferStatus, setTransferStatus] = useState<string | null>(null);
    const [transferring, setTransferring] = useState(false);
    const [notFoundTracks, setNotFoundTracks] = useState<SpotifyTrack[]>([]);

    const tracksRef = useRef<HTMLDivElement>(null);

    const spotifyToken = localStorage.getItem('spotifyAccessToken');
    const deezerToken = localStorage.getItem('deezerAccessToken');
    const spotifyHeaders = { Authorization: `Bearer ${spotifyToken}` };

    const [playlistsRefresh, setPlaylistsRefresh] = useState(0);

    useEffect(() => {
        if (tracks.length > 0 && tracksRef.current) {
            tracksRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [tracks]);

    useEffect(() => {
        const handler = () => setPlaylistsRefresh(n => n + 1);
        window.addEventListener('spotify-playlist-created', handler);
        return () => window.removeEventListener('spotify-playlist-created', handler);
    }, []);

    useEffect(() => {
        const fetchPlaylists = async () => {
            const token = localStorage.getItem('spotifyAccessToken');
            if (!token) {
                setPlaylistsError('Aucun token Spotify trouvé.');
                setPlaylistsLoading(false);
                return;
            }
            setPlaylistsLoading(true);
            try {
                const response = await axios.get('/spotify-api/v1/me/playlists', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { limit: 50 },
                });
                setPlaylists(response.data.items);
                setPlaylistsError(null);
            } catch (err) {
                console.error('Error fetching Spotify playlists:', err);
                setPlaylistsError('Impossible de charger les playlists Spotify.');
            } finally {
                setPlaylistsLoading(false);
            }
        };
        fetchPlaylists();
    }, [playlistsRefresh]);

    async function handlePlaylistClick(playlist: SpotifyPlaylist) {
        setSelectedPlaylist(playlist);
        setTracks([]);
        setTracksError(null);
        setTransferStatus(null);
        setNotFoundTracks([]);
        setTracksLoading(true);
        try {
            const allTracks = await getAllTracks(playlist.id);
            setTracks(allTracks);
        } catch (err) {
            console.error('Error fetching Spotify tracks:', err);
            setTracksError('Impossible de charger les tracks.');
        } finally {
            setTracksLoading(false);
        }
    }

    async function getAllTracks(playlistId: string, offset = 0, accumulated: SpotifyTrack[] = []): Promise<SpotifyTrack[]> {
        const response = await axios.get(`/spotify-api/v1/playlists/${playlistId}/items`, {
            headers: spotifyHeaders,
            params: { limit: 100, offset },
        });
        const rawItems: any[] = response.data.items || [];
        const items: SpotifyTrack[] = rawItems
            .map((entry: any) => entry.item ?? entry.track)
            .filter(Boolean);
        const newAccumulated = [...accumulated, ...items];
        const newOffset = offset + rawItems.length;
        if (newOffset < response.data.total) {
            return getAllTracks(playlistId, newOffset, newAccumulated);
        }
        return newAccumulated;
    }

    async function handleTransferToDeezer() {
        if (!selectedPlaylist || !deezerToken) return;
        setTransferring(true);
        setTransferStatus('Transfert en cours...');
        setNotFoundTracks([]);

        let found = 0;
        const deezerIds: number[] = [];
        const missing: SpotifyTrack[] = [];

        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];
            setTransferStatus(`Recherche des titres... ${i + 1}/${tracks.length}`);
            try {
                const q = `track:"${track.name}" artist:"${track.artists?.[0]?.name}"`;
                const res = await axios.get('/deezer-api/search', {
                    params: { q, access_token: deezerToken, limit: 1 },
                });
                if (res.data.data?.length > 0) {
                    deezerIds.push(res.data.data[0].id);
                    found++;
                } else {
                    missing.push(track);
                }
            } catch {
                missing.push(track);
            }
        }

        if (deezerIds.length === 0) {
            setTransferStatus('Aucun titre trouvé sur Deezer.');
            setTransferring(false);
            return;
        }

        try {
            setTransferStatus('Création de la playlist sur Deezer...');
            const createRes = await axios.post(
                `/deezer-api/user/me/playlists`,
                null,
                { params: { title: selectedPlaylist.name, access_token: deezerToken } }
            );
            const newPlaylistId = createRes.data.id;

            await axios.post(
                `/deezer-api/playlist/${newPlaylistId}/tracks`,
                null,
                { params: { songs: deezerIds.join(','), access_token: deezerToken } }
            );

            setTransferStatus(`✓ ${found}/${tracks.length} titres transférés vers Deezer`);
            setNotFoundTracks(missing);
            window.dispatchEvent(new Event('deezer-playlist-created'));
        } catch (err) {
            console.error('Error creating Deezer playlist:', err);
            setTransferStatus('Erreur lors de la création de la playlist sur Deezer.');
        } finally {
            setTransferring(false);
        }
    }

    if (playlistsLoading) return <div></div>;
    if (playlistsError) return <div style={{ color: '#f88' }}>Error: {playlistsError}</div>;

    return (
        <div>
            <PlaylistsContainer>
                {playlists.map(playlist => (
                    <PlaylistCard
                        key={playlist.id}
                        onClick={() => handlePlaylistClick(playlist)}
                        style={{ cursor: 'pointer', border: selectedPlaylist?.id === playlist.id ? '2px solid #1ed760' : undefined }}
                    >
                        <PlaylistImage
                            src={playlist.images?.[0]?.url}
                            alt={playlist.name}
                        />
                        <PlaylistTitle style={{ color: '#fff' }}>{playlist.name}</PlaylistTitle>
                    </PlaylistCard>
                ))}
            </PlaylistsContainer>

            {selectedPlaylist && (
                <div style={{ marginLeft: '20px' }}>
                    <button
                        onClick={handleTransferToDeezer}
                        disabled={!deezerToken || transferring}
                        style={{
                            marginBottom: '10px',
                            padding: '8px 16px',
                            background: deezerToken ? 'rgb(162, 56, 255)' : '#555',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: deezerToken ? 'pointer' : 'not-allowed',
                            fontWeight: 'bold',
                        }}
                    >
                        {transferring ? transferStatus : '← Transférer vers Deezer'}
                    </button>
                    {!deezerToken && <span style={{ color: '#888', fontSize: '12px', marginLeft: '8px' }}>Connectez-vous à Deezer d'abord</span>}
                    {!transferring && transferStatus && (
                        <div style={{ color: '#1ed760', fontSize: '13px', marginBottom: '8px' }}>{transferStatus}</div>
                    )}
                    {!transferring && notFoundTracks.length > 0 && (
                        <details style={{ marginTop: '6px' }}>
                            <summary style={{ cursor: 'pointer', fontSize: '13px', color: '#888' }}>
                                {notFoundTracks.length} titre{notFoundTracks.length > 1 ? 's' : ''} non trouvé{notFoundTracks.length > 1 ? 's' : ''} sur Deezer
                            </summary>
                            <ul style={{ margin: '6px 0 0 0', padding: '0 0 0 16px', fontSize: '12px', color: '#aaa' }}>
                                {notFoundTracks.map(t => (
                                    <li key={t.id}>{t.name} — {t.artists?.[0]?.name}</li>
                                ))}
                            </ul>
                        </details>
                    )}
                </div>
            )}

            {tracksLoading && <div style={{ color: '#888', marginLeft: '20px' }}>Chargement des tracks...</div>}
            {tracksError && <div style={{ color: '#f88', marginLeft: '20px', fontSize: '14px', marginTop: '10px' }}>Erreur : {tracksError}</div>}
            {!tracksLoading && !tracksError && selectedPlaylist && tracks.length === 0 && (
                <div style={{ color: '#888', marginLeft: '20px', marginTop: '10px', fontSize: '13px' }}>
                    Aucune musique trouvée (vérifier la console du navigateur).
                </div>
            )}

            {tracks.length > 0 && (
                <TracksContainer ref={tracksRef}>
                    {tracks.map(track => (
                        <TrackCard key={track.id}>
                            <TrackImage src={track.album?.images?.[0]?.url} alt={track.name} />
                            <TrackInfo>
                                <TrackTitle style={{ color: '#fff' }}>{track.name}</TrackTitle>
                                <TrackArtist>{track.artists?.[0]?.name}</TrackArtist>
                            </TrackInfo>
                        </TrackCard>
                    ))}
                </TracksContainer>
            )}
        </div>
    );
}

export default UserPlaylistsSpotify;
