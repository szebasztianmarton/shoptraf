# ShopTraf - Price Monitoring App 📊

Egy intelligens ár-monitorozó alkalmazás, amely segít követni a termékárak változásait és kapni az értesítéseket, ha az ár csökken. Az alkalmazás az Expo és React Native technológiákon alapul, teljes platform támogatással (iOS, Android és web).

## 📋 Projekt Információ

- **Név**: shoptraf
- **Verzió**: 1.0.0
- **Típus**: Price Monitoring Application
- **Framework**: [Expo](https://expo.dev) 55+
- **React verzió**: 19.2.0
- **TypeScript**: Teljes támogatás

## 🚀 Gyors Kezdés

### Előfeltételek

- Node.js 18+ verzió
- npm vagy yarn

### Telepítés

1. **Függőségek telepítése**

   ```bash
   npm install
   ```

2. **Alkalmazás indítása**

   ```bash
   npm start
   ```

3. **Platformok közötti választás**
   - iOS: `npm run ios`
   - Android: `npm run android`
   - Web: `npm run web`

## ✨ Főbb Funkciók

- **Ár Monitorozás** - Kövesd nyomon a terméked árát valós időben
- **Értesítések** - Kaptass értesítéseket, ha az ár csökken
- **Árhistória** - Tekintsd meg az árak történetét grafikonon
- **Kedvencek** - Mentsd el a kedvenc termékeket
- **Sötét/Világos Téma** - Válassz a sötét és világos téma között
- **Platform Agnosztikus** - Működik mobil és webes eszközökön

## 📁 Projekt Szerkezete

```
src/
├── app/                  # Expo Router oldal komponensek
│   ├── _layout.tsx      # Fő layout komponens
│   ├── index.tsx        # Kezdőoldal - nyomon követett termékek listája
│   └── explore.tsx      # Felfedezés oldal - új termékek hozzáadása
├── components/          # Újrahasználható UI komponensek
│   ├── app-tabs.tsx     # Tabulátor navigáció
│   ├── themed-*.tsx     # Témás komponensek
│   └── ui/              # UI komponenseink
├── hooks/               # Custom React hookok
│   ├── use-theme.ts     # Téma kezelés
│   └── use-color-scheme.ts  # Szín séma logika
├── constants/           # Alkalmazás konstansok
│   └── theme.ts         # Téma beállítások
└── global.css          # Globális stílusok

assets/
├── expo.icon/          # Expo ikon konfigurációk
└── images/             # Alkalmazás képek és ikonok
```

## 🛠️ Elérhető Parancsok

| Parancs                 | Leírás                         |
| ----------------------- | ------------------------------ |
| `npm start`             | Fejlesztési szerver indítása   |
| `npm run ios`           | iOS szimulátor indítása        |
| `npm run android`       | Android emulátor indítása      |
| `npm run web`           | Web verzió indítása            |
| `npm run lint`          | Kód linting futtatása          |
| `npm run reset-project` | Projekt alaphelyzetbe állítása |

## 🎨 Megjelenés és Stílus

Az alkalmazás támogatja a:

- **Sötét és világos témákat** - automatikus rendszer preferencia alapján
- **Reszponzív dizájnt** - mobil és asztali eszközökhöz optimalizálva
- **Árváltozás megjelenítés** - vizuális jelzések az ár csökkenéséhez/emelkedéséhez
- **Grafikonok** - árhistória vizualizálása

## 📱 Platform Támogatás

- **iOS**: Expo szimulátorral vagy fizikai eszközön
- **Android**: Android emulátor vagy fizikai eszköz
- **Web**: Webböngészőben való futtatás

## 🔧 Fejlesztés

### TypeScript

A projekt teljes TypeScript támogatással rendelkezik. Az összes komponens és hook típusosított.

### Expo Router

Az alkalmazás file-based routingot használ. Az `src/app/` könyvtár az oldal szerkezetét határozza meg.

### Téma Rendszer

A `use-theme` és `use-color-scheme` hooksok segítségével könnyedén kezelhető a téma az alkalmazásban.

### Ár Monitorozás Logika

Az alkalmazás az alábbi funkciókkal rendelkezik:

- Termékek nyomon követése
- Ár összehasonlítás és előzmények
- Értesítések az ár változásáról
- Adattárolás és szinkronizálás

## 📦 Főbb Dependenciák

- **expo-router**: File-based routing
- **@react-navigation**: Navigációs logika
- **expo-font**: Egyedi betűtípusok
- **expo-image**: Optimalizált képkezelés
- **expo-glass-effect**: Üveg effektusok (iOS)

## 🐛 Hibaelhárítás

### Projekt alaphelyzetbe állítása

Ha problémákat tapasztal, próbálja meg a projektet alaphelyzetbe állítani:

```bash
npm run reset-project
```

### Cache törlése

```bash
npm start -- --clear
```

## 📝 Licenc

[Licenc információ hozzáadása szükséges]

## 👥 Fejlesztés

Az alkalmazás aktívan fejlesztés alatt áll. Ez egy Price Monitoring megoldás, amely segít a felhasználóknak követni az árváltozásokat és értesítéseket kapni a kedvezményes árakról.

### 🎯 Jövőbeli Funkciók

- [ ] Push értesítések implementálása
- [ ] Árkomparátor különböző kereskedők között
- [ ] Előrejelzés és trendanalízis
- [ ] Bejelentkezés és felhasználói fiókok
- [ ] Adatbázis integráció az árhistóriához
- [ ] Export funkcionalitás (CSV, PDF)

Javaslatokért és hibákért nyújtsunk be pull requesteket!
