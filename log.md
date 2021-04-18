# 1. Příprava prostředí

# Inicializace npm, konfigurace Parcel.js bundleru

- npm init
- npm install -g parcel-bundler

- mkdir src
- touch src/app.js src/index.html

# App.js

- npm install react react-dom
- V aplikaci jsem použil funkcionální psaní komponent. Tzn. že každá komponenta je jenom obyčejná funkce, která vrací JSX.
- Použil jsem to proto, že je to teď asi nejpopulárnejší a má to řadu výhod jako je velikost, performance apod.

```javascript
const Komponentna = () => {
	return (
		<div>
			JSX funguje podobně jako Vue.js
			<template>
				<div>..</div>
			</template>.
		</div>
	);
};
```

- Inicializace reactu funguje hodně podobně jako ve Vue 2 i 3. Tzn. váže se k nějakýmu elementu na stránce, kde react dynamicky renderuje obsah. Já jsem ten Element pojmenoval 'ceska-posta-app' a je v index.html.

```javascript
//React
import React from "react";

const App = () => <></>;
ReactDOM.render(<App />, document.getElementById("ceska-posta-app"));
```

# 2. Layout + Texty

- npm install @material-core @material-icons
- https://material-ui.com/ - je to knihovna ui komponent, která vychází z google material. To proto abych se musel dělat s komponentami typu button, tabulka apod. + to apsoň nějak vypadá.
- použil jsem pro začátek komponenty - Container, Box, Paper, přidal jsem buttony apod.

- mkdir src/libs && touch locale.js
- mkdir src/locales && touch app.json
- všechny texty vkládám do app.json pod nějaký klíč.
- v lib jsem si udělal jednoduchou funkci, která do které jako parametr dám klíč a ta funkce z app.json vrátí string, který potřebuju.
- Je to častý pattern, protože pak není v komponentách zbytečný text, ale čistě kód. Často nebo pokaždé se proto používá knihovna i18n, která funguje na stejném principu, ale je chytřejší. Řeší se s ní nějaká lokalizace.

```javascript
<Container>
	<Box display="flex" justifyContent="center">
		<Paper style={{ flex: 1 }}>
			<Typography component="h1" variant="h3" align="center"></Typography>
			<Typography component="h2" variant="h4" align="center"></Typography>
			<Box display="flex" justifyContent="center" py={3}>
				<ButtonGroup size="small" disabled={loading}>
					<Button>{t("arrival_plural")}</Button>
					<Button>{t("departure_plural")}</Button>
				</ButtonGroup>
			</Box>
			<Divider />

			<Box p={2}>
				<Grid container spacing={3} justify="center" alignItems="center">
					<Grid item>
						<TextField
							label={t("filterByCallSign")}
							variant="outlined"
							size="small"
						/>
					</Grid>
					<Grid item>
						<TextField
							type="date"
							label={t("chooseDate")}
							variant="outlined"
							size="small"
						/>
					</Grid>
				</Grid>
			</Box>
			<Divider />
		</Paper>
	</Box>
</Container>
```

# 3. Změna tabu přílety / odlety

- Vytvořil jsem si konstantu pro keys do lokal storrage, do kterého jsem vložil VIEW_TYPE_KEY: "flightViewtype" a

```javascript
const LocalStorageKey = {
	VIEW_TYPE_KEY: "flightViewtype",
};
```

- touch src/libs/localstorage.js
- file obsahuje dvě funkce, které jsou pomocníkem pro práci s localstorage.
- funkce load, se pomocí parametru key podívá do localstorage a vrátí data, který jsou pod tímhle klíčem uložený
- funkce persist, zase pomocí parametru key vloží data pod určitým klíčem.

- Do komponenty jsem si pak vytvořil reactivní proměnnou
- Ve funkcionálním typu komponent se pro reaktivní promněnné používá useState, kde jako parametr funkce je počáteční hodnota.
- useState vrací pole ve které je pod indexem 0 samotná value a pod indexem 1 funkce, která dovoluje změnit tu reaktivní proměnou. Ve výsledku je to podobné jako je ve vue3 setup funkce. tam se používá pro reaktivní proměný funkce "reactive"
- Jako počáteční hodnotu konstanty jsem použil load(LocalStorageKey.VIEW_TYPE_KEY) což je uložená hodnota z localstorrage.
- Když žádná hodnota neexistuje funkce load vrátí undefined a proto používám jako defaultní parametr konstatnu pro přílety.

```javascript
const [viewMode, setViewMode] = useState(
	load(LocalStorageKey.VIEW_TYPE_KEY) || ViewMode.ARRIVAL_TYPE
);
```

- Aby to něco dělalo, tak jsem si button pro přílet navázal event, který mění reaktivní proměnnou viewMode a zároveň proměnou propíšu do localstorage aby při refreshi stránky zůstala zachována aktuální hodnota. To stejné jsem udělal u buttonu pro odlety.
- vytvořil jsem proto funkci která vrací všechny props na základě parametru funkce, který assignuju ke komponentě Button
- syntaxt {...funkce()} dělá úplně to stejný jako je ve vue v-bind="objekt"

```javascript
const viewModeButtonProps = (type) => ({
	onClick: () => {
		persist(LocalStorageKey.VIEW_TYPE_KEY, type);
		setViewMode(type);
	},
	color: type === viewMode ? "secondary" : "default",
});

<ButtonGroup size="small" disabled={loading}>
	<Button {...viewModeButtonProps(ViewMode.ARRIVAL_TYPE)}>
		{t("arrival_plural")}
	</Button>
	<Button {...viewModeButtonProps(ViewMode.DEPARTURE_TYPE)}>
		{t("departure_plural")}
	</Button>
</ButtonGroup>;
```

# 4. Fetch dat

- npm install axios
- mkdir src/api
- vytvořil jsem si api file, kde jsem si nastavil axios, aby měl nějaké defaultní headery + base URL.
- API url jsem uložil do .env
- Pak jsem si vytvořil dvě wrapper funkce které vracej samotný axios. Jednu na fetch dat z příletů a jednu z odletů

- v Komponentě jsem pak vytvořil 3 reaktivní proměnné. data (proměná která drží data z api), loading (indikace pending promisu) a error, který drží nějaký error.

```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(false);
const [data, setData] = useState([]);
```

- Dál bylo potřeba udělat funkci pomocí které se budou volat funkce z api.
- Je to jednoduchá asynchronní funkce, která na základě reaktivní proměnné viewMode použije správné api a uloží data.
- Jediné, co je divné, tak api potřebuje dva query parametry, začátek hledanýho období a konec hledanýho obodbí v unixu - což je datum ne v milisekundách jak to bývá normálně ale ve vteřinách.
- Aby se stím dobře pracovalo použil jsem knihovnu moment.js - je to taková nejběžnější knihovna pro práci s datem a časem

```javascript
const fetchFlights = async () => {
	setLoading(true);

	const dateAsMoment = moment(date);
	const begin = dateAsMoment.clone().startOf("date").unix();
	const end = dateAsMoment.clone().endOf("date").unix();

	try {
		let response;
		if (viewMode === ViewMode.ARRIVAL_TYPE) {
			const arrivals = await api.getArrivalApi(begin, end);
			response = arrivals;
		}
		if (viewMode === ViewMode.DEPARTURE_TYPE) {
			const departures = await api.getDepartureApi(begin, end);
			response = departures;
		}
		setData(response.data);
		setError(false);
	} catch (error) {
		if (error && error.response.status !== 404) {
			setError(true);
		}
	} finally {
		setLoading(false);
	}
};
```

- Funkci fetchFlights jsem potřeboval volat vždy, kdy se změní proměná viewMode a stejně tak na první load.
- k tomu je hook který se jmenuje useEffect - je to kombinace vue mounted a updated.
- do use Effectu se dává callback a jako druhej parametr je pole s dependancy, který to čekuje a pak znovu tu funkci spustí

```javascript
useEffect(() => {
	fetchFlights();
}, [viewMode]);
```

# 5. Filtry

- proto aby fungovali filtry, tak jsem musel si vedle proměnné data udělat copii, kterou jsem nazval shallowData. Do ní jsem ukládám vyfiltrovaná data na základě nějého hledenáho výrazu z proměnné searchedQuery. Filtr pro hledaný výraz teda funguje tak, že hledá pouze z těch dat který jsou stažený. Žádnej api endpoint jsem totiž nenašel

- Druhej filtr je nějakej date input, který na change ukládá datamu do proměný date, date je pak vložený jako dependancy u useEffect. tzn. že kdykoliv se změní hodnota proměný date, tak se stáhnou nová data o letech.

# 6. Tabulka

- v components je udělaná jednoduchá komponenta pro výpis záznamů o letech.
- Tabulka přímá nějaká props, který jsou definována pomocí propTypes.
- Mimo to jsou ve stejné složce enumy, zas nějaké stringy a util jednoduché funkce vztažené přímo k tabulce.

- app.js jsem si udělal konstatnu table, která obsahuje všechny data vztažené k tabulce. Pro definici sloupců jsem si udělal funcki createTableClumn, která v podstatě jen namapovává nějaký datat ke sloupci - hlavní je key (nějaký vybraný parametr z api třeba firstSeen) a title (název sloupce nějaký string).
- Pak tam jsou data, což je přemapovaný response z api na základě parametrů který jsem dal do columns. Poslední je nějakej status té tabulky -což je jenom string, na základě kterého rozlišuju v jakém stavu tabulka momentálně je tzn. loading - tabulka se načítá, noResults - tabulka je bez výsledků. Na základě toho v komponentě datatable renderuji různý stavy.
