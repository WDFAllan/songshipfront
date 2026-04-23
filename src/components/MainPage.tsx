import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import SongShipLogo from '../images/SongShip.png';
import DeezerLogo from '../images/DeezerLogo.png';
import SpotifyLogo from '../images/SpotifyLogo.png';
import LoginButtonDeezer from './Deezer/LoginButtonDeezer';
import LoginButtonSpotify from './Spotify/LoginButtonSpotify';
import '../styles/css/MainPage.css';
import '../styles/css/LoginButton.css';

type Service = 'deezer' | 'spotify';

type NormalizedPlaylist = {
    id: string;
    title: string;
    image: string;
};

type NormalizedTrack = {
    id: string;
    title: string;
    artist: string;
    image: string;
};

function MainPage() {
    // ── Auth ──────────────────────────────────────────────────
    const [deezerLoggedIn, setDeezerLoggedIn] = useState(false);
    const [spotifyLoggedIn, setSpotifyLoggedIn] = useState(false);
    const [deezerUser, setDeezerUser] = useState<{ name: string } | null>(null);
    const [spotifyUser, setSpotifyUser] = useState<{ display_name: string } | null>(null);

    // ── Direction ─────────────────────────────────────────────
    const [source, setSource] = useState<Service>('deezer');
    const destination: Service = source === 'deezer' ? 'spotify' : 'deezer';

    // ── Playlists ─────────────────────────────────────────────
    const [playlists, setPlaylists] = useState<NormalizedPlaylist[]>([]);
    const [playlistsLoading, setPlaylistsLoading] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState<NormalizedPlaylist | null>(null);
    const [playlistsRefresh, setPlaylistsRefresh] = useState(0);

    // ── Tracks ────────────────────────────────────────────────
    const [tracks, setTracks] = useState<NormalizedTrack[]>([]);
    const [tracksLoading, setTracksLoading] = useState(false);
    const tracksRef = useRef<HTMLDivElement>(null);

    // ── Transfer ──────────────────────────────────────────────
    const [transferring, setTransferring] = useState(false);
    const [transferStatus, setTransferStatus] = useState<string | null>(null);
    const [notFoundTracks, setNotFoundTracks] = useState<NormalizedTrack[]>([]);

    // ── Init auth ─────────────────────────────────────────────
    useEffect(() => {
        // Spotify token from cross-origin hash redirect
        const hash = window.location.hash.substring(1);
        if (hash) {
            const params = new URLSearchParams(hash);
            const spotifyToken = params.get('spotify_access_token');
            if (spotifyToken) {
                localStorage.setItem('spotifyAccessToken', spotifyToken);
                const refresh = params.get('spotify_refresh_token');
                if (refresh) localStorage.setItem('spotifyRefreshToken', refresh);
                const exp = params.get('spotify_expires_at');
                if (exp) localStorage.setItem('spotifyTokenExpiresAt', exp);
                window.history.replaceState(null, '', '/');
                setSpotifyLoggedIn(true);
            }
        }

        const deezerToken = localStorage.getItem('deezerAccessToken');
        const deezerExp = localStorage.getItem('deezerTokenExpiresAt');
        if (deezerToken && (!deezerExp || Date.now() < parseInt(deezerExp))) {
            setDeezerLoggedIn(true);
        } else if (deezerToken) {
            localStorage.removeItem('deezerAccessToken');
            localStorage.removeItem('deezerTokenExpiresAt');
        }

        const spotifyToken = localStorage.getItem('spotifyAccessToken');
        const spotifyExp = localStorage.getItem('spotifyTokenExpiresAt');
        if (spotifyToken && (!spotifyExp || Date.now() < parseInt(spotifyExp))) {
            setSpotifyLoggedIn(true);
        } else if (spotifyToken) {
            localStorage.removeItem('spotifyAccessToken');
            localStorage.removeItem('spotifyRefreshToken');
            localStorage.removeItem('spotifyTokenExpiresAt');
        }
    }, []);

    // ── User profiles ─────────────────────────────────────────
    useEffect(() => {
        if (!deezerLoggedIn) { setDeezerUser(null); return; }
        const token = localStorage.getItem('deezerAccessToken');
        axios.get('/deezer-api/user/me', { params: { access_token: token } })
            .then(r => setDeezerUser(r.data))
            .catch(() => { });
    }, [deezerLoggedIn]);

    useEffect(() => {
        if (!spotifyLoggedIn) { setSpotifyUser(null); return; }
        const token = localStorage.getItem('spotifyAccessToken');
        axios.get('/spotify-api/v1/me', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setSpotifyUser(r.data))
            .catch(() => { });
    }, [spotifyLoggedIn]);

    // ── Fetch playlists ───────────────────────────────────────
    useEffect(() => {
        const sourceLoggedIn = source === 'deezer' ? deezerLoggedIn : spotifyLoggedIn;
        if (!sourceLoggedIn) { setPlaylists([]); return; }

        setPlaylists([]);
        setPlaylistsLoading(true);
        setSelectedPlaylist(null);
        setTracks([]);
        setTransferStatus(null);
        setNotFoundTracks([]);

        const run = async () => {
            try {
                if (source === 'deezer') {
                    const token = localStorage.getItem('deezerAccessToken');
                    const r = await axios.get('/deezer-api/user/me/playlists', { params: { access_token: token } });
                    setPlaylists((r.data.data || []).map((p: any) => ({
                        id: String(p.id), title: p.title, image: p.picture,
                    })));
                } else {
                    const token = localStorage.getItem('spotifyAccessToken');
                    const r = await axios.get('/spotify-api/v1/me/playlists', {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { limit: 50 },
                    });
                    setPlaylists((r.data.items || []).map((p: any) => ({
                        id: p.id, title: p.name, image: p.images?.[0]?.url,
                    })));
                }
            } catch (err) { console.error('[fetchPlaylists]', err); }
            finally { setPlaylistsLoading(false); }
        };
        run();
    }, [source, deezerLoggedIn, spotifyLoggedIn, playlistsRefresh]);

    // ── Auto-scroll to tracks ─────────────────────────────────
    useEffect(() => {
        if (tracks.length > 0 && tracksRef.current) {
            tracksRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [tracks]);

    // ── Select playlist ───────────────────────────────────────
    async function handlePlaylistClick(playlist: NormalizedPlaylist) {
        setSelectedPlaylist(playlist);
        setTracks([]);
        setTransferStatus(null);
        setNotFoundTracks([]);
        setTracksLoading(true);
        try {
            if (source === 'deezer') {
                const token = localStorage.getItem('deezerAccessToken')!;
                const raw = await fetchDeezerTracks(Number(playlist.id), token);
                setTracks(raw.map((t: any) => ({
                    id: String(t.id), title: t.title, artist: t.artist.name, image: t.album.cover,
                })));
            } else {
                const token = localStorage.getItem('spotifyAccessToken')!;
                const raw = await fetchSpotifyTracks(playlist.id, token);
                setTracks(raw.map((t: any) => ({
                    id: t.id, title: t.name, artist: t.artists?.[0]?.name ?? '', image: t.album?.images?.[0]?.url,
                })));
            }
        } catch { }
        finally { setTracksLoading(false); }
    }

    async function fetchDeezerTracks(id: number, token: string, index = 0, acc: any[] = []): Promise<any[]> {
        const r = await axios.get(`/deezer-api/playlist/${id}/tracks`, {
            params: { access_token: token, index, limit: 25 },
        });
        const data = r.data.data;
        if (!data.length) return acc;
        return fetchDeezerTracks(id, token, index + data.length, [...acc, ...data]);
    }

    async function fetchSpotifyTracks(id: string, token: string, offset = 0, acc: any[] = []): Promise<any[]> {
        const r = await axios.get(`/spotify-api/v1/playlists/${id}/items`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { limit: 100, offset },
        });
        const raw = r.data.items || [];
        const items = raw.map((e: any) => e.item ?? e.track).filter(Boolean);
        const next = [...acc, ...items];
        if (offset + raw.length < r.data.total) return fetchSpotifyTracks(id, token, offset + raw.length, next);
        return next;
    }

    // ── Transfer ──────────────────────────────────────────────
    async function handleTransfer() {
        if (!selectedPlaylist || transferring) return;
        setTransferring(true);
        setTransferStatus('Transfert en cours...');
        setNotFoundTracks([]);
        const missing: NormalizedTrack[] = [];

        if (source === 'deezer') {
            const token = localStorage.getItem('spotifyAccessToken')!;
            const headers = { Authorization: `Bearer ${token}` };
            const uris: string[] = [];

            for (let i = 0; i < tracks.length; i++) {
                const t = tracks[i];
                setTransferStatus(`Recherche... ${i + 1}/${tracks.length}`);
                try {
                    const r = await axios.get('/spotify-api/v1/search', {
                        headers,
                        params: { q: `track:${t.title} artist:${t.artist}`, type: 'track', limit: 1 },
                    });
                    const items = r.data.tracks?.items;
                    if (items?.length > 0) uris.push(items[0].uri);
                    else missing.push(t);
                } catch { missing.push(t); }
            }

            if (!uris.length) {
                setTransferStatus('Aucun titre trouvé sur Spotify.');
                setTransferring(false);
                return;
            }
            try {
                setTransferStatus('Création de la playlist...');
                const created = await axios.post(
                    '/spotify-api/v1/me/playlists',
                    { name: selectedPlaylist.title, description: '', public: false },
                    { headers: { ...headers, 'Content-Type': 'application/json' } }
                );
                for (let i = 0; i < uris.length; i += 100) {
                    await axios.post(
                        `/spotify-api/v1/playlists/${created.data.id}/items`,
                        { uris: uris.slice(i, i + 100) },
                        { headers: { ...headers, 'Content-Type': 'application/json' } }
                    );
                }
                setTransferStatus(`✓ ${uris.length}/${tracks.length} titres transférés vers Spotify`);
                setNotFoundTracks(missing);
                setPlaylistsRefresh(n => n + 1);
            } catch {
                setTransferStatus('Erreur lors de la création de la playlist Spotify.');
            }
        } else {
            const token = localStorage.getItem('deezerAccessToken')!;
            const ids: number[] = [];

            for (let i = 0; i < tracks.length; i++) {
                const t = tracks[i];
                setTransferStatus(`Recherche... ${i + 1}/${tracks.length}`);
                try {
                    const r = await axios.get('/deezer-api/search', {
                        params: { q: `track:"${t.title}" artist:"${t.artist}"`, access_token: token, limit: 1 },
                    });
                    if (r.data.data?.length > 0) ids.push(r.data.data[0].id);
                    else missing.push(t);
                } catch { missing.push(t); }
            }

            if (!ids.length) {
                setTransferStatus('Aucun titre trouvé sur Deezer.');
                setTransferring(false);
                return;
            }
            try {
                setTransferStatus('Création de la playlist...');
                const created = await axios.post('/deezer-api/user/me/playlists', null, {
                    params: { title: selectedPlaylist.title, access_token: token },
                });
                await axios.post(`/deezer-api/playlist/${created.data.id}/tracks`, null, {
                    params: { songs: ids.join(','), access_token: token },
                });
                setTransferStatus(`✓ ${ids.length}/${tracks.length} titres transférés vers Deezer`);
                setNotFoundTracks(missing);
                setPlaylistsRefresh(n => n + 1);
            } catch {
                setTransferStatus('Erreur lors de la création de la playlist Deezer.');
            }
        }
        setTransferring(false);
    }

    // ── Logout ────────────────────────────────────────────────
    function logoutDeezer() {
        localStorage.removeItem('deezerAccessToken');
        localStorage.removeItem('deezerTokenExpiresAt');
        setDeezerLoggedIn(false);
        if (source === 'deezer') { setPlaylists([]); setSelectedPlaylist(null); setTracks([]); }
    }

    function logoutSpotify() {
        localStorage.removeItem('spotifyAccessToken');
        localStorage.removeItem('spotifyRefreshToken');
        localStorage.removeItem('spotifyTokenExpiresAt');
        setSpotifyLoggedIn(false);
        if (source === 'spotify') { setPlaylists([]); setSelectedPlaylist(null); setTracks([]); }
    }

    // ── Derived ───────────────────────────────────────────────
    const DEEZER_COLOR = 'rgb(162,56,255)';
    const SPOTIFY_COLOR = 'rgb(30,215,96)';
    const sourceColor = source === 'deezer' ? DEEZER_COLOR : SPOTIFY_COLOR;
    const destColor = destination === 'deezer' ? DEEZER_COLOR : SPOTIFY_COLOR;
    const sourceLoggedIn = source === 'deezer' ? deezerLoggedIn : spotifyLoggedIn;
    const destLoggedIn = destination === 'deezer' ? deezerLoggedIn : spotifyLoggedIn;
    const canTransfer = sourceLoggedIn && destLoggedIn && !!selectedPlaylist && !transferring;

    return (
        <div className="app">
            {/* ── HEADER ── */}
            <header className="app-header">
                <div className="header-service">
                    <img src={DeezerLogo} alt="Deezer" className="service-logo" />
                    {deezerLoggedIn
                        ? <div className="user-badge" style={{ borderColor: DEEZER_COLOR }}>
                            <span className="badge-name">{deezerUser?.name ?? '...'}</span>
                            <button className="logout-btn" onClick={logoutDeezer} title="Déconnexion">×</button>
                        </div>
                        : <LoginButtonDeezer />
                    }
                </div>

                <img src={SongShipLogo} alt="SongShip" className="app-logo" />

                <div className="header-service header-service--right">
                    {spotifyLoggedIn
                        ? <div className="user-badge" style={{ borderColor: SPOTIFY_COLOR }}>
                            <span className="badge-name">{spotifyUser?.display_name ?? '...'}</span>
                            <button className="logout-btn" onClick={logoutSpotify} title="Déconnexion">×</button>
                        </div>
                        : <LoginButtonSpotify />
                    }
                    <img src={SpotifyLogo} alt="Spotify" className="service-logo spotify-logo" />
                </div>
            </header>

            {/* ── MAIN ── */}
            <main className="app-main">

                {/* Direction */}
                {(deezerLoggedIn || spotifyLoggedIn) && (
                    <div className="direction-bar">
                        <div className="direction-end">
                            <span className="direction-label">Source</span>
                            <div className="direction-pill" style={{ borderColor: sourceColor, color: sourceColor }}>
                                {source === 'deezer' ? 'Deezer' : 'Spotify'}
                            </div>
                        </div>
                        <div className="direction-center">
                            <span className="direction-arrow">→</span>
                            <button
                                className="swap-btn"
                                onClick={() => setSource(s => s === 'deezer' ? 'spotify' : 'deezer')}
                                title="Inverser la direction"
                            >
                                ⇄
                            </button>
                        </div>
                        <div className="direction-end">
                            <span className="direction-label">Destination</span>
                            <div className="direction-pill" style={{ borderColor: destColor, color: destColor }}>
                                {destination === 'deezer' ? 'Deezer' : 'Spotify'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Playlists */}
                {!sourceLoggedIn && (deezerLoggedIn || spotifyLoggedIn) && (
                    <div className="not-connected">
                        <p>Connectez-vous à <strong style={{ color: sourceColor }}>{source === 'deezer' ? 'Deezer' : 'Spotify'}</strong> pour voir vos playlists</p>
                    </div>
                )}
                {sourceLoggedIn && (
                    <section className="section">
                        <h2 className="section-title">Mes playlists</h2>
                        {playlistsLoading
                            ? <p className="muted">Chargement...</p>
                            : (
                                <div className="playlist-grid">
                                    {playlists.map(p => (
                                        <div
                                            key={p.id}
                                            className={`playlist-card${selectedPlaylist?.id === p.id ? ' selected' : ''}`}
                                            style={{ '--accent': sourceColor } as React.CSSProperties}
                                            onClick={() => handlePlaylistClick(p)}
                                        >
                                            <img src={p.image} alt={p.title} className="playlist-img" />
                                            <p className="playlist-name">{p.title}</p>
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                    </section>
                )}

                {/* Tracks */}
                {selectedPlaylist && (
                    <section className="section" ref={tracksRef}>
                        <div className="tracks-header">
                            <h2 className="section-title">{selectedPlaylist.title}</h2>
                            <div className="tracks-actions">
                                {!destLoggedIn && (
                                    <p className="muted" style={{ fontSize: '13px' }}>
                                        Connectez-vous à {destination === 'deezer' ? 'Deezer' : 'Spotify'} pour transférer
                                    </p>
                                )}
                                {destLoggedIn && (
                                    <button
                                        className="transfer-btn"
                                        style={{ '--accent': destColor } as React.CSSProperties}
                                        onClick={handleTransfer}
                                        disabled={!canTransfer}
                                    >
                                        {transferring
                                            ? transferStatus
                                            : `Transférer vers ${destination === 'deezer' ? 'Deezer' : 'Spotify'}`
                                        }
                                    </button>
                                )}
                            </div>
                        </div>

                        {!transferring && transferStatus && (
                            <p className="transfer-status" style={{ color: destColor }}>{transferStatus}</p>
                        )}

                        {!transferring && notFoundTracks.length > 0 && (
                            <details className="not-found">
                                <summary>
                                    {notFoundTracks.length} titre{notFoundTracks.length > 1 ? 's' : ''} non trouvé{notFoundTracks.length > 1 ? 's' : ''} sur {destination === 'deezer' ? 'Deezer' : 'Spotify'}
                                </summary>
                                <ul>
                                    {notFoundTracks.map(t => <li key={t.id}>{t.title} — {t.artist}</li>)}
                                </ul>
                            </details>
                        )}

                        {tracksLoading
                            ? <p className="muted">Chargement des pistes...</p>
                            : (
                                <div className="track-list">
                                    {tracks.map(t => (
                                        <div key={t.id} className="track-card">
                                            <img src={t.image} alt={t.title} className="track-img" />
                                            <div className="track-info">
                                                <p className="track-title">{t.title}</p>
                                                <p className="track-artist">{t.artist}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                    </section>
                )}
            </main>
        </div>
    );
}

export default MainPage;
