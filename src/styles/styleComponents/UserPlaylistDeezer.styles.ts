import styled from 'styled-components';

export const PlaylistsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
  width: 50%
`;

export const PlaylistImage = styled.img`
width: 100%;
height: 100px;
object-fit: cover;
`;

export const PlaylistCard = styled.div`
  width: 100px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const PlaylistTitle = styled.div`
  padding: 10px;
  font-size: 13px;
  font-weight: bold;
  text-align: center;
`;