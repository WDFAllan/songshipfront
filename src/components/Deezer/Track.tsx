import React from 'react';
import {
    TracksContainer,
    TrackCard,
    TrackImage,
    TrackInfo,
    TrackTitle,
    TrackArtist,
    TrackPreview
}from '../../styles/styleComponents/TrackDeezer.styles'

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

type TracksProps = {
    tracks:Track[];
}

function Tracks({ tracks }: TracksProps) {

    return (
        <TracksContainer>
          {tracks.map((track:Track) => (
            <TrackCard key={track.id}>
              <TrackImage src={track.album.cover} alt={track.title} />
              <TrackInfo>
                <TrackTitle>{track.title}</TrackTitle>
                <TrackArtist>{track.artist.name}</TrackArtist>
              </TrackInfo>
            </TrackCard>
          ))}
        </TracksContainer>
      );

}

export default Tracks;