import React, { useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function Callback() {
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
            const { access_token,expires } = response.data;
            console.log(response)
            if (access_token) {
              // Enregistrer le token (par exemple, dans le local storage)
              localStorage.setItem('deezerAccessToken', access_token);
              const expiresAt = Date.now() + expires * 1000; // convert seconds to milliseconds
              localStorage.setItem('deezerTokenExpiresAt', expiresAt.toString());

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