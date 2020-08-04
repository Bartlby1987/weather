import React from 'react';
import ShowCityAndWeather from "./ShowCityAndWeather/ShowCityAndWeather";
import AddCity from "../Properties/AddCity/AddCity";
import "./ShowCitesAndWeather.css";

class ShowCitesAndWeather extends React.Component {

    render() {
        let showCityAndWeather = [];
        let deleteCity = this.props.delete;
        let threeDaysWeather = this.props.threeDaysWeather;
        let onClickShowWeatherOnThreeDays = this.props.onClickShowWeatherOnThreeDays;
        let weatherData = this.props.cities;
        let source = this.props.source;
        for (let i = 0; i < weatherData.length; i++) {
            let dataComponent = <div key={i}>
                <ShowCityAndWeather
                    changeThreeDayWeatherStatus={this.props.changeThreeDayWeatherStatus}
                    weather={weatherData[i]}
                    spinnerOnThreeDays={this.props.spinnerOnThreeDays}
                    delete={deleteCity} source={source}
                    threeDaysWeather={threeDaysWeather}
                    onClickShowWeatherOnThreeDays={onClickShowWeatherOnThreeDays}
                />
            </div>;
            showCityAndWeather.push(dataComponent)
        }
        return (
            <div>
                <div className="div_border">
                    <AddCity addCity={this.props.addCity} weatherData={weatherData}
                             onClickRefreshData={this.props.onClickRefreshData}
                             changeSpinnerStatus={this.props.changeSpinnerStatus}/>
                </div>
                <div>
                    {showCityAndWeather}
                </div>
            </div>
        );
    }
}

export default ShowCitesAndWeather;
