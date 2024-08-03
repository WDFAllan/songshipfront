import React, { useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const Callback: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchAccessToken = async () => {
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
  
        if (code) {
          const appId = process.env.REACT_APP_DEEZER_APP_ID;
          const secret = process.env.REACT_APP_DEEZER_SECRET
          const tokenUrl = `https://connect.deezer.com/oauth/access_token.php?app_id=${appId}&secret=${secret}&code=${code}&output=json`;
  
          try {
            const response = await axios.get(tokenUrl);
            const { access_token } = response.data;
  
            if (access_token) {
              // Enregistrer le token (par exemple, dans le local storage)
              localStorage.setItem('deezerAccessToken', access_token);
  
              // Rediriger l'utilisateur
              navigate('/');
            }
          } catch (error) {
            console.error('Error fetching access token:', error);
          }
        }
      };
  
      fetchAccessToken();
    }, [location, navigate]);
  
    return <div>Loading...</div>;
  };
  
  export default Callback;