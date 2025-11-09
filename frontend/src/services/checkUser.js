import apiAuth from "./apiAuth";

//Ispitujemo je li korisnik ulogiran:
export async function checkUser() {
    try{
        //Poziv backend endpointa za profile
        const res = await apiAuth.get('/profile/');
        console.log("checkUser success:", res.status);
        //Ako vrati 200 -> korisnik postoji -> vraćamo true
        return true;
    } catch(err) {
        console.log("checkUser failed:", err.response?.status, err);
        //Ako vrati >= 400 -> korisnik nije ulogiran (nema access token - Authorization polja nema ili sadrži krivi token) -> vraćamo false
        if(err.response) {
            console.log(err.response.data);
            return false;
        } else {
            console.log("Network error or server down!");
            return false;
        }
    }
}