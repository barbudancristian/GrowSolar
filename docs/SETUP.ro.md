# GrowSolar – ghid de configurare

> **English:** [SETUP.en.md](SETUP.en.md)

Ghidul explică instalarea GrowSolar, fiecare opțiune din fereastra *Add integration*, alegerea manuală a senzorilor pentru sisteme care nu sunt DongleGrowatt sau Solar Assistant și problemele cele mai frecvente.

## Cuprins

1. [Înainte de început](#1-înainte-de-început)
2. [Instalare](#2-instalare)
3. [Pasul 1: sursa datelor](#3-pasul-1-sursa-datelor)
4. [Pasul 2: sistemul](#4-pasul-2-sistemul)
5. [Pasul 3: senzorii (sursa manuală)](#5-pasul-3-senzorii-sursa-manuală)
6. [Prognoza solară și vremea](#6-prognoza-solară-și-vremea)
7. [Setările invertoarelor](#7-setările-invertoarelor)
8. [Modificarea setărilor mai târziu](#8-modificarea-setărilor-mai-târziu)
9. [Probleme frecvente](#9-probleme-frecvente)
10. [Dezinstalare](#10-dezinstalare)

## 1. Înainte de început

GrowSolar afișează doar date care există deja în Home Assistant. Verifică trei lucruri:

- **Senzorii tăi sunt în Home Assistant**: cel puțin puterea solară, consumul, puterea bateriei și starea de încărcare, iar ideal și contoarele de energie (kWh).
- **Baza de date îi înregistrează.** Graficele folosesc istoricul, iar *Totalurile* folosesc statisticile pe termen lung. Dacă în `configuration.yaml` ai secțiunea `recorder:` → `exclude:`, verifică să nu fie excluși senzorii solari (de exemplu printr-o regulă ca `"*.growatt_*"`). Senzorii excluși dau grafice goale.
- **Contoarele de energie au statistici pe termen lung.** Au nevoie de `device_class: energy` și `state_class: total_increasing` (sau `total`). Majoritatea integrărilor le setează. Verifici în **Developer tools → Statistics**: senzorul trebuie să apară acolo fără erori.

## 2. Instalare

1. **HACS → ⋮ (dreapta sus) → Custom repositories**: repository `https://github.com/barbudancristian/GrowSolar`, tipul **Integration** → **Add**.
2. Cauți **GrowSolar** în HACS → îl deschizi → **Download**.
3. **Settings → System → Restart Home Assistant.** Fără restart integrarea nu apare în listă.
4. **Settings → Devices & services → + Add integration →** cauți **GrowSolar**.

Se poate configura un singur GrowSolar pe un Home Assistant. Instalare manuală, fără HACS: copiezi `custom_components/growsolar` în `config/custom_components/` și repornești.

## 3. Pasul 1: sursa datelor

Prima fereastră întreabă de unde citește GrowSolar sistemul. Sub întrebare arată câte invertoare a găsit în acest moment pentru fiecare sursă.

| Opțiune | Când o alegi | Ce găsește singur |
| --- | --- | --- |
| **DongleGrowatt** | Invertor(oare) Growatt cu stick-ul ShineWiFi-X2 scris cu firmware-ul [Growatt-SPF6K-HA](https://github.com/barbudancristian/Growatt-SPF6K-HA) (câte unul pe invertor) și pachetul lui pentru Home Assistant. GrowSolar poate și schimba setările invertoarelor. | Fiecare invertor (`sensor.growatt_1_…`, `growatt_2_…`), cu PV1/PV2, baterie, ieșire, rețea, temperaturi, stare, setări și contoare de energie. |
| **Solar Assistant** | Fără dongle-uri: invertorul sau invertoarele sunt legate cu cablu USB la Solar Assistant, iar Home Assistant ia datele de la Solar Assistant prin MQTT. | Fiecare invertor și totalurile sistemului, bateria (BMS: celule, cicluri, stare de sănătate), contoarele zilnice de energie, prognoza Solar Assistant și norii. |
| **Aleg eu senzorii** | Alt tip de invertor (nu Growatt: Deye, Victron, Huawei, SMA …) sau orice sistem ai cărui senzori există deja în Home Assistant (alte integrări, senzori template). | Nimic; alegi senzorii la pasul 3. |

Cu **DongleGrowatt**, pagina poate arăta și logo-ul Growatt (Dashboard, Grafice, Totaluri) și o poză a invertorului deasupra fiecărui invertor (Invertoare). Imaginile nu fac parte din GrowSolar: copiezi `growatt-logo.png` și `growatt-inverter.png` în `<config>/www/growsolar/` (de exemplu cu add-on-ul File editor sau Samba) și dai refresh. Fără ele nu apare nimic.

Primele două surse găsesc senzorii după **ID-ul unic**, deci nu contează cum ai redenumit entitățile. Dacă o sursă arată 0 invertoare, senzorii ei lipsesc sau sunt dezactivați, ori nu sunt senzori MQTT.

## 4. Pasul 2: sistemul

| Câmp | Ce completezi |
| --- | --- |
| **Nume în bara laterală** | Titlul paginii și al intrării din bara laterală, de exemplu `Solar` sau `GrowSolar`. |
| **Număr de invertoare** | Între 1 și 6. Valoarea propusă e numărul de invertoare găsite. La sursa manuală lași 1: senzorii aleși manual descriu tot sistemul. |
| **Capacitatea bateriei (kWh)** | Capacitatea utilă a tuturor bateriilor împreună. Exemplu: 304 Ah × 51,2 V ≈ 15,6 kWh. Se folosește pentru timpul până la plin sau gol și pentru ritmul în %/h. |
| **Puterea panourilor (kWp)** | Puterea totală a panourilor, de exemplu 6 × 600 W = 3,6. Setează doar scala indicatorului solar; 0 înseamnă 6 kW pe invertor. |
| **Preț energie pe kWh** | Cât plătești pentru 1 kWh din rețea. Se folosește pentru economiile din *Totaluri*: (consum − energie din rețea) × preț. |
| **Monedă** | Apare lângă economii, de exemplu `RON`, `EUR`. |
| **Ordinea invertoarelor** (opțional) | Ce invertor din sursă apare în fiecare coloană, de exemplu `1,3,2`. Solar Assistant numerotează invertoarele după portul USB în care sunt conectate, deci numerele lui pot să nu corespundă fazelor: dacă invertorul lui 3 e pe L2, scrii `1,3,2`. Gol = ordinea din sursă. |
| **Numele invertoarelor** (opțional) | Numele coloanelor și ale liniilor din grafice, de exemplu `L1,L2,L3`. Gol = `#1`, `#2`, ... |

Pentru DongleGrowatt și Solar Assistant configurarea se termină aici, iar pagina **GrowSolar** apare în bara laterală. Dacă nu apare, dai refresh în browser (pe telefon închizi aplicația și o redeschizi).

## 5. Pasul 3: senzorii (sursa manuală)

Fereastra apare doar pentru **Aleg eu senzorii** și, mai târziu, la **Configure**. Toate câmpurile sunt opționale, dar pagina e completă doar în măsura în care îi dai senzori.

Listele arată doar senzorii cu **clasa** potrivită (putere, energie, tensiune, baterie). Dacă senzorul tău lipsește dintr-o listă, îl deschizi în Home Assistant → ⚙ → **Show as** și alegi clasa potrivită, sau îi ceri autorului integrării să o seteze.

### Valori live

| Câmp | Ce senzor alegi | Unitate | La ce folosește |
| --- | --- | --- | --- |
| **Putere solară** | Puterea PV totală, pe toate stringurile și invertoarele | W | Indicatorul solar, fluxul, *Solar azi*, graficele |
| **Consum** | Puterea folosită de casă (ieșirea invertorului) | W | Indicatorul de consum, privirea de ansamblu, graficele |
| **Putere baterie (+ încărcare)** | Puterea bateriei, **pozitivă la încărcare** | W | Indicatorul bateriei, ritmul în %/h, timpul rămas, graficele |
| **Putere rețea (+ import)** | Puterea luată din rețea, **pozitivă când iei din rețea** | W | Indicatorul rețelei, privirea de ansamblu |
| **Starea de încărcare a bateriei** | SOC | % | Cardul și pagina bateriei, graficul SOC |
| **Tensiune baterie** | Tensiunea bateriei | V | Cardul și pagina bateriei |
| **Tensiune rețea** | Tensiunea rețelei | V | Cardul rețelei (prezentă sau absentă) |

**Semnele.** GrowSolar așteaptă ca bateria să fie **pozitivă la încărcare**, iar rețeaua **pozitivă când iei din rețea**. Multe integrări folosesc semnul invers la baterie (pozitivă la descărcare). Nu e nevoie de senzori template: bifezi căsuțele de la sfârșitul ferestrei:

- **Senzorul bateriei e pozitiv la descărcare (inversează)**
- **Senzorul rețelei e negativ când iei din rețea (inversează)**

Verificare rapidă: într-o zi cu soare, când panourile acoperă consumul, cardul bateriei trebuie să arate *se încarcă*, iar puterea bateriei trebuie să fie pozitivă.

**Unitățile.** Puterile trebuie să fie în **W**. Dacă senzorul tău e în kW, îl deschizi → ⚙ → **Unit of measurement** → **W**; Home Assistant convertește valoarea.

### Contoarele de energie (pentru *Totaluri*, *Solar azi* și economii)

| Câmp | Ce senzor alegi |
| --- | --- |
| **Energie solară** | Energia produsă de panouri (kWh) |
| **Energie consumată** | Energia folosită de casă (kWh) |
| **Energie din rețea** | Energia luată din rețea (kWh) |
| **Energie încărcată în baterie** | Energia băgată în baterie (kWh) |
| **Energie descărcată din baterie** | Energia scoasă din baterie (kWh) |

Merg ambele feluri de contoare:

- **cumulative**, care doar cresc (de exemplu *Total PV energy*);
- **zilnice**, care se resetează la miezul nopții (de exemplu *Today's PV energy*), dacă au `state_class: total_increasing`.

Dacă le ai pe amândouă, alege-l pe cel cumulativ. Merge și un helper *utility_meter*.

### Vreme (prognoza norilor)

Entitatea de vreme folosită pentru norii de după ora curentă și pentru iconițele de vreme din graficul *Solar azi*. Dacă o lași goală, se folosește prima entitate de vreme din Home Assistant (de exemplu `weather.forecast_home`, de la Met.no).

### Exemplu: invertor Deye sau Sunsynk (integrarea Solarman)

| Câmp | Senzor tipic |
| --- | --- |
| Putere solară | *PV power* (sau suma *PV1 power* + *PV2 power*) |
| Consum | *Load power* |
| Putere baterie | *Battery power*, de obicei pozitivă la descărcare → bifezi **inversează** |
| Putere rețea | *Grid power* sau *Total grid power*, verifici semnul când iei din rețea |
| Starea de încărcare | *Battery SOC* |
| Energie solară | *Total PV energy* |
| Energie consumată | *Total load consumption* |
| Energie din rețea | *Total energy bought* |
| Energie încărcată / descărcată | *Total battery charge* / *Total battery discharge* |

Numele diferă între integrări și versiuni; contează sensul și unitatea.

### Celulele bateriei (BMS PACE, opțional)

Dacă bateria are BMS PACE, GrowSolar îl poate citi direct printr-un convertor RS485–Ethernet (de ex. Waveshare RS485 to POE ETH) și arată în pagina **Baterie** fiecare celulă, temperaturile, MOSFET-urile, echilibrarea și alarmele.

1. Legi convertorul la mufa **RS485** liberă a bateriei (la bateriile legate la invertor prin CAN, cea de lângă CAN): pinii 1/8 = B, 2/7 = A. Dacă nu răspunde, inversezi A și B sau încerci una din mufele RS485 de paralel.
2. Convertorul: 9600 baud, 8N1, **TCP Server**, protocol **None** (transparent), IP static.
3. În GrowSolar → **Configure**: adresa convertorului și portul (implicit 4196).

Senzorii apar ca `sensor.growsolar_bms_*` (celule, temperaturi, tensiune, curent, capacitate, SOC/SOH, cicluri, stare). La prima pornire GrowSolar caută singur versiunea protocolului și adresa BMS-ului.

## 6. Prognoza solară și vremea

- **Curba de prognoză, *Rămas*, *Mâine*.** GrowSolar folosește prognoza solară pe care Home Assistant o are deja în **Settings → Dashboards → Energy → Solar panels → Solar production forecast**: **Solcast** (pe intervale de 30 de minute) sau **Forecast.Solar** (pe ore). Instalezi integrarea preferată și o adaugi acolo. Fără prognoză, când sursa e Solar Assistant se folosește prognoza lui.
- **Norii și iconițele.** Norii până la ora curentă vin din Solar Assistant (dacă e sursa); după ora curentă vin din prognoza pe ore a entității de vreme.

## 7. Setările invertoarelor

Pagina **Setări** arată toate setările invertoarelor una lângă alta, câte o coloană pe invertor, și colorează cu portocaliu ce diferă între invertoare (invertoarele în paralel ar trebui să aibă aceleași valori).

- **Schimbi un invertor:** apeși pe valoarea lui, alegi valoarea nouă, **Salvează**.
- **Schimbi toate:** alegi valoarea în coloana *Toate invertoarele*, **Aplică pe toate**.

Înainte să trimită ceva, o fereastră arată valoarea veche și cea nouă pentru fiecare invertor. Invertoarele se schimbă **pe rând**: GrowSolar așteaptă până când invertorul raportează valoarea nouă (cel mult 90 s) și abia apoi o trimite pe următoarea; dacă un invertor nu o primește, **se oprește**. Lista *Modificări* arată fiecare pas și rezultatul lui. Doar administratorii Home Assistant pot schimba setări.

De unde vin setările:

- **Solar Assistant:** entitățile select / number din descoperirea lui MQTT (`inverter_N_…`), deci pagina merge imediat după configurarea GrowSolar.
- **DongleGrowatt:** entitățile din pachetul Growatt-SPF6K-HA, versiunea 0.2 sau mai nouă (`growatt_N_…`). Pe fiecare dongle bifezi **Allow inverter settings changes from Home Assistant** în *Dongle settings*. Dongle-ul acceptă doar o listă sigură de setări, în limitele din manual, și recitește fiecare valoare; dacă refuză, motivul apare lângă *neconfirmat*. Cu dongle-ul ai în plus prioritatea energiei (BLU / LBU), intervalul de intrare AC, orele rețelei, buzzer-ul și un buton care pune ora pe ceasurile invertoarelor.

Tipul bateriei și pornirea / oprirea la distanță se văd, dar nu se pot schimba de aici: o valoare greșită poate rupe legătura cu BMS-ul sau poate opri ieșirea. După ce adaugi sau scoți entități de setare, reîncarci GrowSolar (**Settings → Devices & services → GrowSolar → ⋮ → Reload**).

## 8. Modificarea setărilor mai târziu

**Settings → Devices & services → GrowSolar → Configure.** Prima fereastră are setările sistemului și arată ce senzori nu au fost găsiți. A doua fereastră îți permite, pentru orice sursă, să adaugi sau să înlocuiești senzori individuali, să bifezi inversarea semnului și să alegi entitatea de vreme. După **Submit**, pagina se reîncarcă singură.

Ca să schimbi **sursa datelor**, ștergi GrowSolar (⋮ → **Delete**) și îl adaugi din nou.

## 9. Probleme frecvente

| Ce vezi | Cauza și soluția |
| --- | --- |
| Nu apare **GrowSolar** în bara laterală | Home Assistant nu a fost repornit după descărcare, sau browserul arată o pagină veche: dai refresh forțat (Ctrl/Cmd + Shift + R). Verifică să nu fie ascuns: profilul tău → *Change the order and hide items*. |
| „GrowSolar nu are încă entități” | Sursa nu a găsit nimic. Deschizi **Configure** și alegi senzorii, sau verifici sursa (vezi pasul 1). |
| Valorile live sunt bune, **graficele sunt goale** | Senzorii sunt excluși din baza de date (`recorder: exclude:` în `configuration.yaml`). Scoți excluderea și repornești; graficele se completează de atunci încolo. |
| ***Totalurile* sunt goale** | Contoarele de energie nu au statistici pe termen lung: verifici în **Developer tools → Statistics** și `state_class` al contoarelor. Statisticile încep din ziua în care senzorul a fost înregistrat prima dată. |
| **Valori uriașe sau negative** în *Totaluri* | Suma statisticii a repornit de la zero (de obicei după ce senzorul a fost exclus din baza de date). GrowSolar ignoră salturile negative; ca să repari și statisticile Home Assistant, folosești **Developer tools → Statistics → Adjust sum**. |
| Bateria arată *se încarcă* când se descarcă | Semn invers: bifezi **Senzorul bateriei e pozitiv la descărcare** în **Configure**. |
| Nu apare curba de prognoză sau *Mâine* | Nu ai prognoză solară în setările Energy (vezi secțiunea 6). |
| Nu apare linia norilor după ora curentă | Nu ai entitate de vreme, sau ea nu are prognoză pe ore. Alegi alta în **Configure → Vreme**. |
| Economiile par greșite | Verifici **Preț energie pe kWh** și că ai setat **Energie din rețea**; economiile sunt (consum − energie din rețea) × preț. |

Dacă problema rămâne, deschide un issue pe GitHub cu o captură și cu rândurile despre `growsolar` din **Settings → System → Logs**.

## 10. Dezinstalare

**Settings → Devices & services → GrowSolar → ⋮ → Delete**, apoi **HACS → GrowSolar → ⋮ → Remove** și restart. GrowSolar nu creează entități și nu îți modifică datele, deci nu rămâne nimic în urmă.
