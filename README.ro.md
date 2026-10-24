<p align="center"><img src="https://raw.githubusercontent.com/barbudancristian/GrowSolar/main/docs/img/icon.png" width="96" alt="GrowSolar"></p>

# GrowSolar

Un dashboard solar pentru Home Assistant, făcut pentru invertoarele off-grid **Growatt SPF** (unul sau mai multe, de exemplu câte unul pe fiecare fază). Adaugă în bara laterală pagina **GrowSolar** cu șase vederi: **Dashboard**, **Grafice**, **Totaluri**, **Invertoare**, **Baterie** și **Setări**.

> **English:** [README.md](https://github.com/barbudancristian/GrowSolar/blob/main/README.md)

Citește datele din senzorii pe care îi ai deja în Home Assistant:

- **DongleGrowatt**: stick-ul Growatt ShineWiFi-X2 cu firmware-ul [Growatt-SPF6K-HA](https://github.com/barbudancristian/Growatt-SPF6K-HA) și pachetele lui pentru Home Assistant;
- **Solar Assistant**: prin integrarea lui MQTT;
- **orice alți senzori** pe care îi alegi de mână.

Senzorii sunt găsiți automat după ID-ul lor unic, deci nu contează cum i-ai redenumit.

<img src="https://raw.githubusercontent.com/barbudancristian/GrowSolar/main/docs/img/dashboard.png" width="900" alt="Dashboard GrowSolar">

*Capturile arată date de exemplu.*

## Vederi

**Dashboard**: modul de lucru al invertorului, energia solară de azi și vârful zilei, tensiunea rețelei, tensiunea bateriei, starea de încărcare și cât de repede se schimbă (%/h). Indicatoare live pentru consum, solar, rețea și baterie. *Solar azi* cu ieri, produs, rămas și mâine, curba de putere comparată cu prognoza și cu norii. Privire de ansamblu peste consum, rețea și solar în ultimele 24 de ore. Apeși pe cardul invertorului sau al bateriei ca să deschizi pagina lui.

**Grafice**: de la 1 oră la 30 de zile sau un interval ales de tine, cu ‹ › ca să mergi înapoi și înainte în timp. Ansamblu, puterea și starea de încărcare a bateriei, cu tensiunea. Tensiunea, curentul și puterea pe MPPT 1 și 2 pentru fiecare invertor. Puterea solară, curentul bateriei și consumul, totale și pe fiecare invertor. Tensiunea și temperatura bateriei, tensiunea de ieșire AC, temperatura invertoarelor, tensiunea și frecvența rețelei, tensiunea bus. Ții degetul sau mouse-ul pe grafic ca să citești valorile (o linie arată același moment pe toate graficele); apeși pe o intrare din legendă ca să ascunzi linia. Tragi cu mouse-ul peste orice grafic ca să mărești toate graficele pe acel interval, iar *Anulează zoom* te duce înapoi.

<img src="https://raw.githubusercontent.com/barbudancristian/GrowSolar/main/docs/img/charts.png" width="900" alt="Grafice">

**Totaluri**: trei secțiuni, fiecare cu un grafic cu suprafețe colorate (bare pentru ani) lângă un tabel cu consumul, producția solară, energia încărcată și descărcată din baterie, energia luată din rețea și trimisă în rețea, plus economiile la prețul tău: o lună zi cu zi, un an lună cu lună (cu ‹ › treci la altă lună sau alt an) și toți anii de când există contoarele. Deasupra fiecărui grafic: economiile din acea lună, din acel an și totalul de la prima lună înregistrată. Butonul de descărcare salvează fiecare tabel ca fișier CSV (aceleași coloane ca exportul Solar Assistant, în Wh).

<img src="https://raw.githubusercontent.com/barbudancristian/GrowSolar/main/docs/img/totals.png" width="900" alt="Totaluri">

**Invertoare**: toate valorile, una lângă alta pentru fiecare invertor, cu o coloană de total: mod, temperatură, tensiune bus, consum, ieșire AC, PV pe fiecare MPPT, baterie, rețea, priorități și serie.

<img src="https://raw.githubusercontent.com/barbudancristian/GrowSolar/main/docs/img/inverters.png" width="900" alt="Invertoare">

**Baterie**: capacitate, stare de încărcare și de sănătate, putere, curent, tensiune, timpul până la plin sau gol, cicluri, tensiunile celulelor și dezechilibrul, temperatura.

<img src="https://raw.githubusercontent.com/barbudancristian/GrowSolar/main/docs/img/battery.png" width="900" alt="Baterie">

**Setări**: toate setările invertoarelor una lângă alta, cu cele care diferă între invertoare marcate. Schimbi un invertor sau **Aplică pe toate** pentru sistemele în paralel: GrowSolar arată ce se schimbă, trimite la câte un invertor pe rând, așteaptă confirmarea valorii noi de la fiecare și se oprește dacă unul nu o primește. Merge cu entitățile de setare din Solar Assistant și cu DongleGrowatt (care adaugă BLU/LBU, intervalul de intrare AC, orele rețelei, buzzer-ul și sincronizarea ceasului).

<img src="https://raw.githubusercontent.com/barbudancristian/GrowSolar/main/docs/img/settings.png" width="900" alt="Setări">

Pagina merge și pe telefon, în română sau engleză, după limba din profilul tău Home Assistant.

<img src="https://raw.githubusercontent.com/barbudancristian/GrowSolar/main/docs/img/mobile.png" width="300" alt="Pe telefon">

## Instalare cu HACS

1. HACS → **⋮ → Custom repositories** → adaugi `https://github.com/barbudancristian/GrowSolar`, tipul **Integration**.
2. Cauți **GrowSolar** în HACS → **Download**.
3. Repornești Home Assistant.
4. **Settings → Devices & services → Add integration → GrowSolar**.

Instalare manuală: copiezi folderul `custom_components/growsolar` în `config/custom_components/` și repornești.

## Configurare

Ghidul complet, cu toate opțiunile, alegerea manuală a senzorilor și problemele frecvente: **[docs/SETUP.ro.md](https://github.com/barbudancristian/GrowSolar/blob/main/docs/SETUP.ro.md)**.

1. **Sursa datelor**: DongleGrowatt, Solar Assistant sau manual. Fereastra arată câte invertoare a găsit pentru fiecare sursă.
2. **Sistem**: numele din bara laterală, numărul de invertoare, capacitatea bateriei (kWh), puterea panourilor (kWp, pentru indicatorul solar), prețul energiei și moneda.
3. Doar pentru sursa manuală: alegi senzorii (putere solară, consum, baterie, rețea, stare de încărcare, contoare de energie), bifezi inversarea semnului dacă senzorul bateriei sau al rețelei folosește semnul invers și, opțional, o entitate de vreme.

Poți schimba totul mai târziu din **Configure**, unde poți și adăuga sau înlocui senzori individuali. Pagina se reîncarcă singură.

## Cerințe și note

- Home Assistant 2024.11 sau mai nou, cu **recorder** pornit (e pornit implicit).
- *Graficele* folosesc istoricul (până la 3 zile) și statisticile la 5 minute sau pe oră (pentru intervale mai lungi). *Totalurile* folosesc statisticile pe termen lung ale contoarelor de energie (`state_class: total_increasing`), deci se completează din ziua în care au pornit contoarele.
- Prognoza: curba punctată pe toată ziua, *Rămas* și *Mâine* vin din prognoza solară din setările Energy ale Home Assistant (**Solcast** sau **Forecast.Solar**); fără ea, din prognoza Solar Assistant. Norii după ora curentă și iconițele de vreme vin dintr-o entitate de vreme (prima găsită sau cea aleasă în Configure).
- Convenția de semn din pagină: puterea bateriei e pozitivă la încărcare, puterea rețelei e pozitivă când iei din rețea.
- Cu DongleGrowatt, *Încărcat în baterie* lipsește, pentru că invertorul nu are contor pentru asta. Pagina bateriei folosește valorile BMS (SOH, cicluri, celule) de la dongle-ul invertorului legat la BMS.
- Doar administratorii Home Assistant pot schimba setările invertoarelor.
- Totul rămâne în Home Assistant-ul tău: pagina nu folosește servicii de pe internet și nici biblioteci externe.

## Credite și licență

Autor: **Barbu Dan-Cristian**. Stilul vizual urmează dashboard-ul solar pentru Home Assistant al lui **Andrei Cristetiu**.

Licență MIT, vezi [LICENSE](https://github.com/barbudancristian/GrowSolar/blob/main/LICENSE). Proiectul nu e afiliat cu Growatt sau Solar Assistant; numele aparțin proprietarilor lor.
