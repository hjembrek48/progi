# Programsko inženjerstvo - Play Trade


> Potencijalna sekcija za deploy link


# Opis projekta
Ovaj projekt je reultat timskog rada u sklopu projeknog zadatka kolegija [Programsko inženjerstvo](https://www.fer.unizg.hr/predmet/proinz) na Fakultetu elektrotehnike i računarstva Sveučilišta u Zagrebu.


Ovim projektom želimo omogućiti zamjenu društvenih igara između korisnika te tako povećati isplativost igara koje već posjeduju. Željeli bismo korisnicima omogućiti pristup i upoznavanje s novim igrama, samo na par klikova i jednostavno navođenje kroz aplikaciju. Naravno, uz nekoliko ograničenja poput poštivanja dogovora oko zamjene igara ili pak samih uvjeta korištenja, koje sam vlasnik ima pravo postaviti kao dio objave vlastite igre. Motivacija za ovaj projekt proizlazi iz želje za radom u timu na nekom zajedničkom projektu uz pomno praćenje napretka u razvoju i izradi projekta. No ne bilo kojeg projekta, već onog koji će riješiti neki problem interesantne prirode. Konkretno, želimo riješiti problem igara koje na polici možda samo skupljaju prašinu, a netko drugi bi je možda rado htio igrati. Taj problem željeli bih smo riješiti na ekonomičan i pristupačan način, a jedno od rješenja jest ova web-aplikacija pod nazivom Play Trade.


# Funkcijski zahtjevi
- uvid u listu svih objavljenih društvenih igara (i za neregistrirane korisnike)
- registracija i prijava u sustav (važećom adresom e-pošte)
- unos lokacije korisnika
- mogućnost uređivanja vlastitog profila
- prijedlog zamjena po interesima korisnika
- objava društvenih igara
- pregled i moguće uređivanje vlastitih objava na pregledu "Moje igre"
- pretraga uz mogućnost filtriranja
- "Ponuda zamjena"
- pregled ponuda u "Ponuda" (pristiglih i upućenih)
- mogućnost stvaranja liste želja
- primanje obavijesti za ponude i liste želja putem e-pošte
- arhiviranje izvršenih zamjena u "Moje zamjene"
- održavanje platforme od strane sistemskih administratora


# Tehnologije
Za otvaranje ovog projekta koristili smo ove tehnologije/alate:
- frontend:
   - React
   - Bootstrap
- backend:
   - django
- deployment:
   - ???
- autentifikacija:
   - OAuth 2.0
- geolokacija: 
   - OpenStreetMap

# Članovi tima
Članovi tima:
- Hrvoje Jembrek (voditelj)
- Fran Račić
- Andrej Pavić
- Matko Balala
- Lovro Priselec
- Marko Fuček
- Nikola Lip-Nojković

> Popis članova tima/linkovi/ glavni doprinos na(do)pisati


# Način rada
Za rad u timu definirani su kanali komunikacije između članova tima međusobno, a to su primarno WhatsApp te sastavci uživo. Također, unaprijed su definirani i načini komunikacije s demonstratorom te asistentom, uživo u terminima laboratorijskih vježbi ili online preko platforme Teams ili putem e-pošte.

Sama podjela rada inicijalno je podijeljena na frontend i backend dio, prema preferencijama i iskustvima pojedinih članova grupe. Ostatak projekta, poput pisanja dokumentacije, deployanje i testiranja, dogovarani su u hodu između svih članova tima, sukladno željama i mogućnostima članova.

Na samom početku projekta dogovoren je naziv i tima te vođa tima.


# 📝 Kodeks ponašanja [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
Kao studenti sigurno ste upoznati s minimumom prihvatljivog ponašanja definiran u [KODEKS PONAŠANJA STUDENATA FAKULTETA ELEKTROTEHNIKE I RAČUNARSTVA SVEUČILIŠTA U ZAGREBU](https://www.fer.hr/_download/repository/Kodeks_ponasanja_studenata_FER-a_procisceni_tekst_2016%5B1%5D.pdf), te dodatnim naputcima za timski rad na predmetu [Programsko inženjerstvo](https://wwww.fer.hr).
Očekujemo da ćete poštovati [etički kodeks IEEE-a](https://www.ieee.org/about/corporate/governance/p7-8.html) koji ima važnu obrazovnu funkciju sa svrhom postavljanja najviših standarda integriteta, odgovornog ponašanja i etičkog ponašanja u profesionalnim aktivnosti. Time profesionalna zajednica programskih inženjera definira opća načela koja definiranju  moralni karakter, donošenje važnih poslovnih odluka i uspostavljanje jasnih moralnih očekivanja za sve pripadnike zajenice.

Kodeks ponašanja skup je provedivih pravila koja služe za jasnu komunikaciju očekivanja i zahtjeva za rad zajednice/tima. Njime se jasno definiraju obaveze, prava, neprihvatljiva ponašanja te  odgovarajuće posljedice (za razliku od etičkog kodeksa). U ovom repozitoriju dan je jedan od široko prihvačenih kodeks ponašanja za rad u zajednici otvorenog koda.
>### Poboljšajte funkcioniranje tima:
>* definirajte načina na koji će rad biti podijeljen među članovima grupe
>* dogovorite kako će grupa međusobno komunicirati.
>* ne gubite vrijeme na dogovore na koji će grupa rješavati sporove primjenite standarde!
>* implicitno podrazmijevamo da će svi članovi grupe slijediti kodeks ponašanja.
 
>###  Prijava problema
>Najgore što se može dogoditi je da netko šuti kad postoje problemi. Postoji nekoliko stvari koje možete učiniti kako biste najbolje riješili sukobe i probleme:
>* Obratite mi se izravno [e-pošta](mailto:vlado.sruk@fer.hr) i  učinit ćemo sve što je u našoj moći da u punom povjerenju saznamo koje korake trebamo poduzeti kako bismo riješili problem.
>* Razgovarajte s vašim asistentom jer ima najbolji uvid u dinamiku tima. Zajedno ćete saznati kako riješiti sukob i kako izbjeći daljnje utjecanje u vašem radu.
>* Ako se osjećate ugodno neposredno razgovarajte o problemu. Manje incidente trebalo bi rješavati izravno. Odvojite vrijeme i privatno razgovarajte s pogođenim članom tima te vjerujte u iskrenost.

> Prilagoditi ovaj dio da odgovara našoj odabranoj licenciji
# 📝 Licenca
Važeča (1)
[![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

Ovaj repozitorij sadrži otvoreni obrazovni sadržaji (eng. Open Educational Resources)  i licenciran je prema pravilima Creative Commons licencije koja omogućava da preuzmete djelo, podijelite ga s drugima uz 
uvjet da navođenja autora, ne upotrebljavate ga u komercijalne svrhe te dijelite pod istim uvjetima [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License HR][cc-by-nc-sa].
>
> ### Napomena:
>
> Svi paketi distribuiraju se pod vlastitim licencama.
> Svi upotrijebleni materijali  (slike, modeli, animacije, ...) distribuiraju se pod vlastitim licencama.

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: https://creativecommons.org/licenses/by-nc/4.0/deed.hr 
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg

Orginal [![cc0-1.0][cc0-1.0-shield]][cc0-1.0]
>
>COPYING: All the content within this repository is dedicated to the public domain under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.
>
[![CC0-1.0][cc0-1.0-image]][cc0-1.0]

[cc0-1.0]: https://creativecommons.org/licenses/by/1.0/deed.en
[cc0-1.0-image]: https://licensebuttons.net/l/by/1.0/88x31.png
[cc0-1.0-shield]: https://img.shields.io/badge/License-CC0--1.0-lightgrey.svg

### Reference na licenciranje repozitorija
<br>
<br>
<br>

> Predložak temeljen na wiki materijalima projekta [Programsko inženjerstvo](https://github.com/VladoSruk/Programsko-inzenjerstvo/wiki) autora Vlado Sruk, pod licencom CC BY-NC-SA 4.0.
