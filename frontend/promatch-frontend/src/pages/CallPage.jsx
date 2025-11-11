import React from 'react';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY

const CallPage = () => {

  const {id: callid} = useParams ()
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });


  useEffect(() => {
    const initCall = async () => {
      if (!tokenData.token || !authUser || !callid) return;

      try {
        console.log("Initializing Stream video client...");

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.avatar,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callid);

        await callInstance.join({ create: true });

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [tokenData, authUser, callid]);


  return (
    <div className='h-screen flex flex-col items-center justify-center'>
      {isLoading || isConnecting ? (
         <div className="flex items-center justify-center h-full">
         <p>Cargando videochat...</p>
       </div>
      ) : (
        <div className='relative'>
          {client && call ? (
            <StreamVideo client = {client}>
              <StreamCall call={call}>
                <CallContent/>

              </StreamCall>



            </StreamVideo>
          ) : (
            <div className='flex items-center justify-center h-full'>
              <p>Esperando conexión...</p>
            </div>




          )}

        </div>
       


      )}


    </div>
  )
};


const CallContent = () => {
  const {useCallCallingState} = useCallStateHooks()
  const callingState = useCallCallingState()

  const navigate = useNavigate();
  if(callingState === CallingState.LEFT) return navigate("/")
  return(
  
    <StreamTheme>
      <SpeakerLayout/>
      <CallControls/>  
      
    </StreamTheme>
  )  
  
}

export default CallPage