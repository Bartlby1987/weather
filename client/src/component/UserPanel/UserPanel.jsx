import React from 'react';
import './UserPanel.css';
import NavBar from "../NavBar/NavBar";
import ShowCitesAndWeather from "../ShowCitesAndWeather/ShowCitesAndWeather";
import Properties from "../Properties/Propertie";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Route} from 'react-router-dom';
import Popup from "../ShowCitesAndWeather/ShowCityAndWeather/PopUp/PopUp";

const LOCAL_STORAGE_DATA_KEY = 'CitiesData';
const LOCAL_STORAGE_SOURCE_KEY = 'Source';

class UserPanel extends React.Component {
    constructor(props) {
        super(props);
        let data = localStorage.getItem(LOCAL_STORAGE_DATA_KEY);
        let source = localStorage.getItem(LOCAL_STORAGE_SOURCE_KEY);
        if (!JSON.parse(source)) {
            source = {
                yandexFlag: true,
                gismeteoFlag: false,
                weatherFlag: false,
                downloadsTime: false
            }
        } else {
            source = JSON.parse(source)
        }
        try {
            data = JSON.parse(data);
        } catch (e) {
            const localStorageErrorMessage = 'unable to load data from local storage.';
            console.log(localStorageErrorMessage);
            console.log('error:' + e);
            data = [];
        }
        data = data || [];
        this.state = {
            cities: data,
            cityField: "",
            source: source,
            spinnerOnThreeDays: false,
            error: false,
            errorResponse: null,
            badResponse: true,
        }
    };

    changeForecastStatus() {
        this.setState({showForecastWeather: !this.state.showForecastWeather});
    }

    changeSpinnerStatus(value) {
        this.setState({spinnerOnThreeDays: value});
    }

    async changeThreeDayWeatherStatus(city) {
        let dateWeather = JSON.parse(JSON.stringify(this.state.cities));
        for (let i = 0; i < dateWeather.length; i++) {
            if (city === dateWeather[i]["city"]) {
                dateWeather[i]["threeDayWeatherStatus"] = !dateWeather[i]["threeDayWeatherStatus"]
            }
        }
        let cityObj = {"city": city};
        try {
            await this.sendRequest(cityObj, "/weather/changeForecast", "POST");
        } catch (err) {
            console.error(err);
        }
        this.setState({cities: dateWeather});
    }

//todo we have analog this function.It is createUpdatedCitiesList(). Look on logic.
    createDataListForRefreshInformation() {
        let citiesData = this.state.cities;
        if (citiesData.length === 0) {
            return
        }
        let yandex = this.state.source.yandexFlag;
        let gismeteo = this.state.source.gismeteoFlag;
        let weather = this.state.source.weatherFlag;
        let source = [];
        let cities = [];
        let citiesAndSource = {};
        for (let i = 0; i < citiesData.length; i++) {
            let cityAndData = citiesData[i];
            cities.push(cityAndData.city);
        }
        if (yandex) {
            source.push("yandex")
        }
        if (gismeteo) {
            source.push("gismeteo")
        }
        if (weather) {
            source.push("weatherCom")
        }
        citiesAndSource["cities"] = cities;
        citiesAndSource["source"] = source;
        return citiesAndSource
    }

//todo this function must bee fixed in logic
    createUpdatedCitiesList(city) {
        let citiesData = this.state.cities;
        let yandex = this.state.source.yandexFlag;
        let gismeteo = this.state.source.gismeteoFlag;
        let weather = this.state.source.weatherFlag;
        let source = [];
        let cities = [];
        let citiesAndSource = {};
        if (citiesData.length !== 0) {
            for (let i = 0; i < citiesData.length; i++) {
                let cityAndData = citiesData[i];
                cities.push(cityAndData.city)
            }
        } else {
            cities.push(city)
        }
        if (yandex) {
            source.push("yandex")
        }
        if (gismeteo) {
            source.push("gismeteo")
        }
        if (weather) {
            source.push("weatherCom")
        }
        for (let k = 0; k < cities.length; k++) {
            if (cities[k] !== city) {
                cities.push(city)
            }
        }
        citiesAndSource["cities"] = cities;
        citiesAndSource["source"] = source;
        return citiesAndSource
    }

    async onClickDeleteCity(city) {
        let allCitiesData = this.state.cities;
        let newCitiesData = [];
        for (let i = 0; i < allCitiesData.length; i++) {
            if (allCitiesData[i].city !== city) {
                newCitiesData.push(allCitiesData[i])
            }
        }
        this.setState({cities: newCitiesData});
        let cityObj = {"city": city};
        await this.sendRequest(cityObj, "/weather/deleteCity", "POST");
        localStorage.setItem(LOCAL_STORAGE_DATA_KEY, JSON.stringify(newCitiesData))
    }

//todo this function is analogue addCityFunction.
    getNewDataForCity(citiesAndSource) {
        const url = "weather/current";
        const sendPostIPARequest = async (citiesAndSource) => {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(citiesAndSource)
            });
            if (!response.ok) {
                this.changeSpinnerStatus(false);
                return
            }

            if (response.length === 0) {
            } else {
                return await response.json();
            }
        };
        return sendPostIPARequest(citiesAndSource);
    }


    sendRequest = async (data, url, method) => {
        let obj = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        if (data) {
            obj.body = JSON.stringify(data)
        }
        let response = await fetch(url, obj);
        return await response.json();
    };

    async onClickAddCity(city, callback) {
        let cityObj = {"city": city};
        try {
            let addCityResponse = await this.sendRequest(cityObj, "/weather/addCity", "POST");
            if (addCityResponse === true) {
                let currentWeatherResponse = await this.sendRequest(null, "/weather/current", "POST");
                if (callback) callback();
                let currentWeatherData = this.state.cities;
                if (currentWeatherData) {
                    currentWeatherData.push(currentWeatherResponse[0]);
                    this.setState({cities: currentWeatherData});
                    return currentWeatherData
                } else {
                    currentWeatherData = currentWeatherResponse;
                    this.setState({cities: currentWeatherData});
                    return currentWeatherData
                }
            } else {
                this.setState({error: !this.state.error, errorResponse: addCityResponse});
            }
        } catch (err) {
            console.error(err);
        }
    };

    async onClickRefreshData(callback) {
        let citiesAndSource = this.createDataListForRefreshInformation();
        let newWeather = await (await this.getNewDataForCity(citiesAndSource));
        if (!citiesAndSource || !newWeather) {
            return
        }
        let updateDataForAllCities = [];
        let cloneDataForAllCity = JSON.parse(JSON.stringify(this.state.cities));
        for (let i = 0; i < newWeather.length; i++) {
            let newWeatherData = newWeather[i];
            for (let j = 0; j < cloneDataForAllCity.length; j++) {
                let cloneData = cloneDataForAllCity[i];
                if (cloneData["city"] === newWeatherData["city"] && cloneData["threeDayWeatherStatus"]) {
                    newWeatherData["threeDayWeatherStatus"] = true;
//todo it is to many requests. It must be just one with all cities.
                    newWeatherData["threeDayData"] = (await this.getWeatherOnThreeDays(cloneData["city"]));
                }
            }
            updateDataForAllCities.push(newWeatherData);
        }
        localStorage.setItem(LOCAL_STORAGE_DATA_KEY, JSON.stringify(updateDataForAllCities));
        this.setState({cities: updateDataForAllCities});
        if (callback) callback();
    };

    setThreeDayWeatherData(dateWeatherForThreeDay, city) {
        let citiesData = JSON.parse(JSON.stringify(this.state.cities));
        for (let i = 0; i < citiesData.length; i++) {
            let cityData = citiesData[i];
            if (cityData["city"] === city) {
                cityData["threeDayData"] = dateWeatherForThreeDay;
            }
        }
        this.setState({cities: citiesData})
    };

    async getWeatherOnThreeDays(city) {
        const url = "/weather/forecast";
        let cloneSource = JSON.parse(JSON.stringify(this.state.source));
        let newSource = {
            yandexFlag: cloneSource.yandexFlag,
            gismeteoFlag: cloneSource.gismeteoFlag,
            weatherFlag: cloneSource.weatherFlag
        };
        let cityAndSource = {
            citiesSource: newSource,
            city: city
        };
        let sendPostIPARequest = async (cityAndSource) => {
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: (JSON.stringify(cityAndSource))
            });
            if (!response.ok) {
                this.changeThreeDayWeatherStatus(city);
                this.setState({error: !this.state.error, errorResponse: response});
                return
            }

            let threeDaysWeatherData = await response.json();
            if (threeDaysWeatherData.length === 0) {
                this.changeThreeDayWeatherStatus(city);
                this.setState({badResponse: false});
                return
            }
            return (threeDaysWeatherData);
        };
        return await sendPostIPARequest(cityAndSource)
    };

    async onClickShowWeatherOnThreeDays(city) {
        let threeDayWeatherData = await this.getWeatherOnThreeDays(city);
        this.setThreeDayWeatherData(threeDayWeatherData, city);
        return threeDayWeatherData
    };

    onClickChangYandexFlag() {
        let source = this.state.source;
        let newSource = JSON.parse(JSON.stringify(source));
        if (newSource["gismeteoFlag"] === true || newSource["weatherFlag"] === true) {
            newSource["yandexFlag"] = !newSource["yandexFlag"];
            localStorage.setItem(LOCAL_STORAGE_SOURCE_KEY, JSON.stringify(newSource));
            this.setState({source: newSource});
        }
    };

    onClickChangDownloadsTimeFlag() {
        let source = this.state.source;
        let newSource = JSON.parse(JSON.stringify(source));
        newSource["downloadsTime"] = !newSource["downloadsTime"];
        localStorage.setItem(LOCAL_STORAGE_SOURCE_KEY, JSON.stringify(newSource));
        this.setState({source: newSource});
    };

    onClickChangGismeteoFlag() {
        let source = this.state.source;
        let newSource = JSON.parse(JSON.stringify(source));
        if (newSource["yandexFlag"] === true || newSource["weatherFlag"] === true) {
            newSource["gismeteoFlag"] = !newSource["gismeteoFlag"];
            localStorage.setItem(LOCAL_STORAGE_SOURCE_KEY, JSON.stringify(newSource));
            this.setState({source: newSource});
        }
    };

    onClickChangWeatherFlag() {
        let source = this.state.source;
        let newSource = JSON.parse(JSON.stringify(source));
        if (newSource["gismeteoFlag"] === true || newSource["yandexFlag"] === true) {
            newSource["weatherFlag"] = !newSource["weatherFlag"];
            localStorage.setItem(LOCAL_STORAGE_SOURCE_KEY, JSON.stringify(newSource));
            this.setState({source: newSource});
        }
    };

    changeBadResponseStatus() {
        this.setState({badResponse: true});
    };

    async onClickSaveProperties() {
        let source = this.state.source;
        await this.sendRequest(source, "/weather/saveProperties", "POST")
    };

    closePopup() {
        this.setState({error: !this.state.error, errorResponse: null});
    }

    render() {
        let information;
        if (this.state.error) {
            let errorMessage = (` ${this.state.errorResponse}`);
            information = <div>
                {this.state.error ?
                    <Popup
                        text={errorMessage}
                        closePopup={this.closePopup.bind(this)}
                    />
                    : null
                }
            </div>;
        } else if (!this.state.badResponse) {
            information = <div>
                <Popup
                    text="Data not available."
                    closePopup={this.changeBadResponseStatus.bind(this)}
                />
            </div>;
        } else {
            information = <div className="all_info_zoom">
                <NavBar onClickRefresheData={this.onClickRefreshData.bind(this)} source={this.state.source}
                        changeSpinnerStatus={this.changeSpinnerStatus.bind(this)}
                        logOutFromSession={this.props.logOutFromSession}/>
                <Route exact path="/userPanel/main" render={() =>
                    <ShowCitesAndWeather
                        changeThreeDayWeatherStatus={this.changeThreeDayWeatherStatus.bind(this)}
                        spinnerOnThreeDays={this.state.spinnerOnThreeDays}
                        changeSpinnerStatus={this.changeSpinnerStatus.bind(this)}
                        cities={this.state.cities}
                        addCity={this.onClickAddCity.bind(this)}
                        delete={this.onClickDeleteCity.bind(this)}
                        source={this.state.source}
                        onClickRefreshData={this.onClickRefreshData.bind(this)}
                        threeDaysWeather={this.state.threeDaysWeather}
                        onClickShowWeatherOnThreeDays={(city) => this.onClickShowWeatherOnThreeDays(city)}
                    />}
                />
                <Route exact path="/userPanel/properties" render={() => <Properties
                    onClickSaveProperties={this.onClickSaveProperties.bind(this)}
                    onOrOffSourceYandex={this.state.source.yandexFlag}
                    onOrOffSourceGismeteo={this.state.source.gismeteoFlag}
                    onOrOffSourceWeather={this.state.source.weatherFlag}
                    timeFlag={this.state.source.downloadsTime}
                    yandexFlag={this.onClickChangYandexFlag.bind(this)}
                    gismeteoFlag={this.onClickChangGismeteoFlag.bind(this)}
                    onClickChangDownloadsTimeFlag={this.onClickChangDownloadsTimeFlag.bind(this)}
                    weatherFlag={this.onClickChangWeatherFlag.bind(this)}/>}/>
            </div>;
        }
        return (
            <div>
                {information}
            </div>
        );
    }
}

export default UserPanel;
