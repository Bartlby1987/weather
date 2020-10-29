import React from 'react';
import './UserPanel.css';
import NavBar from "../NavBar/NavBar";
import ShowCitesAndWeather from "../ShowCitesAndWeather/ShowCitesAndWeather";
import Properties from "../Properties/Propertie";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Route} from 'react-router-dom';
import Popup from "../ShowCitesAndWeather/ShowCityAndWeather/PopUp/PopUp";

class UserPanel extends React.Component {
    constructor(props) {
        super(props);
        let data;
        let source = {
            yandexFlag: true,
            gismeteoFlag: true,
            weatherFlag: true,
            downloadsTime: true
        };
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
    }

    async componentDidMount() {
        await this.onClickRefreshData();
    }

    changeSpinnerStatus(value) {
        this.setState({spinnerOnThreeDays: value});
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
                let currentWeatherResponse = await this.sendRequest(cityObj, "/weather/current", "POST");
                if (callback) callback();
                let currentWeatherData = JSON.parse(JSON.stringify(this.state.cities));
                if (currentWeatherData) {
                    currentWeatherData.push(currentWeatherResponse);
                } else {
                    currentWeatherData = currentWeatherResponse;
                }
                this.setState({cities: currentWeatherData});
                return currentWeatherData
            } else {
                this.setState({error: !this.state.error, errorResponse: addCityResponse});
            }
        } catch (err) {
            console.error(err);
        }
    };

    async onClickRefreshData(callback) {
        await Promise.all([this.sendRequest(null, '/users/loadUserInfo', 'GET'),
            this.sendRequest(null, '/users/getSource', 'GET')])
            .then(response => {
                if (callback) callback();
                this.setState({cities: response[0], source: response[1]})
            });
    };

    async getWeatherOnThreeDays(city, callback) {
        let citiesInfo = JSON.parse(JSON.stringify(this.state.cities));
        for (let i = 0; i < citiesInfo.length; i++) {
            let cityInfo = citiesInfo[i];
            if (cityInfo["city"] === city && cityInfo["threeDayWeatherStatus"]) {
                cityInfo["threeDayWeatherStatus"] = !cityInfo["threeDayWeatherStatus"]
                await this.sendRequest({"city": city}, "/weather/changeForecast", "POST");
                this.setState({cities: citiesInfo})
                if (callback) callback();
                return;
            }
        }
        Promise.all([(this.sendRequest({"city": city}, "/weather/forecast", "POST")),
            (this.sendRequest({"city": city}, "/weather/changeForecast", "POST"))])
            .then(response => {
                try {
                    for (let i = 0; i < citiesInfo.length; i++) {
                        let cityObj = citiesInfo[i];
                        if (cityObj["city"] === city) {
                            if (!cityObj["threeDayData"]) {
                                cityObj["threeDayData"] = response[0];
                            }
                            cityObj["threeDayWeatherStatus"] = !cityObj["threeDayWeatherStatus"];
                        }
                    }
                    this.setState({cities: citiesInfo})
                    if (callback) callback();
                } catch (err) {
                    console.error(err);
                }
            })
    };

    onClickChangeDownloadsTimeFlag() {
        let newSource = JSON.parse(JSON.stringify(this.state.source));
        newSource["downloadsTime"] = !newSource["downloadsTime"];
        this.setState({source: newSource});
    };

    onClickChangeYandexFlag() {
        let newSource = JSON.parse(JSON.stringify(this.state.source));
        if (newSource["gismeteoFlag"] || newSource["weatherFlag"]) {
            newSource["yandexFlag"] = !newSource["yandexFlag"];
            this.setState({source: newSource});
        }
    };

    onClickChangeGismeteoFlag() {
        let newSource = JSON.parse(JSON.stringify(this.state.source));
        if (newSource["yandexFlag"] || newSource["weatherFlag"]) {
            newSource["gismeteoFlag"] = !newSource["gismeteoFlag"];
            this.setState({source: newSource});
        }
    };

    onClickChangeWeatherFlag() {
        let newSource = JSON.parse(JSON.stringify(this.state.source));
        if (newSource["gismeteoFlag"] || newSource["yandexFlag"]) {
            newSource["weatherFlag"] = !newSource["weatherFlag"];
            this.setState({source: newSource});
        }
    };

    changeBadResponseStatus() {
        this.setState({badResponse: true});
    };

    async onClickSaveProperties() {
        let source = this.state.source;
        await this.sendRequest(source, "/users/saveProperties", "POST")
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
                        spinnerOnThreeDays={this.state.spinnerOnThreeDays}
                        changeSpinnerStatus={this.changeSpinnerStatus.bind(this)}
                        cities={this.state.cities}
                        addCity={this.onClickAddCity.bind(this)}
                        delete={this.onClickDeleteCity.bind(this)}
                        source={this.state.source}
                        onClickRefreshData={this.onClickRefreshData.bind(this)}
                        onClickShowWeatherOnThreeDays={(city, callback) => this.getWeatherOnThreeDays(city, callback)}
                    />}
                />
                <Route exact path="/userPanel/properties" render={() => <Properties
                    onClickSaveProperties={this.onClickSaveProperties.bind(this)}
                    onOrOffSourceYandex={this.state.source.yandexFlag}
                    onOrOffSourceGismeteo={this.state.source.gismeteoFlag}
                    onOrOffSourceWeather={this.state.source.weatherFlag}
                    timeFlag={this.state.source.downloadsTime}
                    yandexFlag={this.onClickChangeYandexFlag.bind(this)}
                    gismeteoFlag={this.onClickChangeGismeteoFlag.bind(this)}
                    onClickChangDownloadsTimeFlag={this.onClickChangeDownloadsTimeFlag.bind(this)}
                    weatherFlag={this.onClickChangeWeatherFlag.bind(this)}/>}/>
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