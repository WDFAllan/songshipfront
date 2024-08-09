import React, { useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import exp from 'constants';

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
            const { access_token, expires} = response.data;
            if (access_token && expires !== undefined ) {

              // save token in localstorage
              localStorage.setItem('deezerAccessToken', access_token);

              if(expires>0){
                const expiresAt = Date.now() + expires * 1000; // convert seconds to milliseconds
                localStorage.setItem('deezerTokenExpiresAt', expiresAt.toString());
              }else{
                localStorage.removeItem('deezerTokenExpiresAt')
              }
              
              // Redirect the user
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