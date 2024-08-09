import styled from 'styled-components';

export const TracksContainer = styled.div`
  margin-top: 20px;
`;

export const TrackCard = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  margin-left: 10px;
`;

export const TrackImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  margin-right: 10px;
`;

export const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TrackTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
`;

export const TrackArtist = styled.div`
  font-size: 12px;
  color: #666;
  text-align:left;
`;

export const TrackPreview = styled.audio`
  margin-top: 5px;
`;