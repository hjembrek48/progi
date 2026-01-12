import { createContext, useContext, useState, useEffect } from "react";
import { checkUser } from "../services/checkUser.js";
import  apiAuth from './../services/apiAuth.js';
import { subscribeUserToPush } from "../services/pushNotifications.js";

const authContext = createContext();

export function AuthProvider({ children }) {
    const [loading, setLoading] = useState(true);
    const [registrationStep, setRegistrationStep] = useState(null);
    // 0 -> server error
    // 1 -> neregistriran
    // 2 -> prošao samo Google OAuth
    // 3 -> potpuno registriran (Google OAuth i lokacija)


    //funkcija za postavljanje statusa u kojem je korisnik, bit će izložena kroz context u svim komponentama
    const fetchUserStatus = async () => {
            setLoading(true);
            try {
                //prvo provjeravamo ima li korisnik access token (logiran google računom):
                const user = await checkUser();
                if (user) { //ako user ima access token, onda provjeravamo lokaciju
                    const location = await apiAuth.get('/profile/location/');
                    if(location.data.latitude && location.data.longitude) {
                        setRegistrationStep(3);
                    } else {
                        setRegistrationStep(2);
                    }
                } else {
                    setRegistrationStep(1);
                }
            } catch(err) {
                setRegistrationStep(0);
            } finally {
                setLoading(false);
            }
        }

    useEffect(() => {
        fetchUserStatus();
    }, []); //odmah pri mountanju wrappera provjeri userStatus

    useEffect(() => {
        if (registrationStep === 3) {
            subscribeUserToPush();
        }
    }, [registrationStep]);

    return(
        //Omata djecu i daje im pristup nad contextom
        <authContext.Provider value={{registrationStep, setRegistrationStep, fetchUserStatus, loading}}>
            { children }
        </authContext.Provider>
    );
}

export function useAuth() {
    //vraća value definiran u authContext.Provider -> de facto pristup tim varijablama iz neke druge komponente
    return useContext(authContext);
}