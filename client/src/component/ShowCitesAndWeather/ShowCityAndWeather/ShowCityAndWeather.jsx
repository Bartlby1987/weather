import React from 'react';
import './ShowCityAndWeather.css';
import ThreeDaysWeather from "./ThreeDaysWeather/ThreeDaysWeather";
import 'bootstrap/dist/css/bootstrap.min.css';
import Spinner from "../../Spinner/Spinner";

class ShowCityAndWeather extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showPopup: true,
            showThreeDaysWeather: false,
            isLoading: true,
            blogItems: [],
            isFetching: false,
            spinnerOnThreeDays: false,
            timeOn: this.props.source.downloadsTime
        };
        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    deleteCity() {
        let deleteCity = this.props.weather.city;
        this.props.delete(deleteCity);
    }

    async onClickShowThreeDaysWeather() {
        this.setState({spinnerOnThreeDays: true});
        let city = this.props.weather.city;
        this.props.changeThreeDayWeatherStatus(city);
        if (!this.state.showThreeDaysWeather) {
            await this.props.onClickShowWeatherOnThreeDays(city)
        }
        this.setState({
            showThreeDaysWeather: !this.state.showThreeDaysWeather,
            spinnerOnThreeDays: false
        });
    }

    render() {
        let weatherData = this.props.weather;
        let city = weatherData.city;
        let yandexTemp;
        let yandexHumidity;
        let gismeteoTemp;
        let gismeteoHumidity;
        let weatherComTemp;
        let weatherComHumidity;
        if (this.props.source.yandexFlag === false || weatherData.yandex === undefined) {
            yandexTemp = "Данных нет";
            yandexHumidity = "Данных нет";
        } else {
            yandexTemp = weatherData.yandex.temp;
            yandexHumidity = weatherData.yandex.humidity;
        }
        if (this.props.source.gismeteoFlag === false || weatherData.gismeteo === undefined) {
            gismeteoTemp = "Данных нет";
            gismeteoHumidity = "Данных нет";
        } else {
            gismeteoTemp = weatherData.gismeteo.temp;
            gismeteoHumidity = weatherData.gismeteo.humidity;
        }
        if (this.props.source.weatherFlag === false || weatherData.weatherCom === undefined) {
            weatherComTemp = "Данных нет";
            weatherComHumidity = "Данных нет";
        } else {
            weatherComTemp = weatherData.weatherCom.temp;
            weatherComHumidity = weatherData.weatherCom.humidity;
            if (weatherComTemp === "0" && weatherComHumidity === "0") {
                weatherComTemp = "Нет данных";
                weatherComHumidity = "Нет данных";
            }
        }
        let showThreeDaysWeather = this.props.weather && this.props.weather.threeDayWeatherStatus && this.props.weather.threeDayData;
        let cityData =
            <div className="div_border_city ">
                <div className="information_position">
                    <button type="button" onClick={this.deleteCity.bind(this)}>&times;</button>
                    <div className="spinner_position">
                        {this.state.spinnerOnThreeDays ? <Spinner/> : null}
                        {this.props.spinnerOnThreeDays ? <Spinner/> : null}
                    </div>
                </div>
                <div onClick={this.onClickShowThreeDaysWeather.bind(this)}>
                    <div className="time_position">
                        {this.state.timeOn ? <div>{this.props.weather.loadCityTime}</div> : null}
                    </div>
                    <h5>
                        Город {city}
                    </h5>
                    <div className="city_data_position">
                        <table border="1" align="center" className="table_size_current">
                            <tbody>
                            <tr>
                                <th>Данные</th>
                                <th>
                                    <div>{"t°"}</div>
                                </th>
                                <th>
                                    <div>{"RH"}</div>
                                </th>
                            </tr>
                            {this.props.source.yandexFlag ?
                                <tr>
                                    <td>{"Yandex"}</td>
                                    <td>{yandexTemp}</td>
                                    <td>{yandexHumidity}</td>
                                </tr> : null}
                            {this.props.source.gismeteoFlag ? <tr>
                                <td>{"Gismeteo"}</td>
                                <td>{gismeteoTemp}</td>
                                <td>{gismeteoHumidity}</td>
                            </tr> : null}
                            {this.props.source.weatherFlag ?
                                <tr>
                                    <td>{"Weather.com"}</td>
                                    <td>{weatherComTemp}</td>
                                    <td>{weatherComHumidity}</td>
                                </tr> : null}
                            </tbody>
                        </table>
                    </div>
                    <div className="forecast_data_position">
                        <div className={showThreeDaysWeather ? "section" : "section collapsed"}>
                            <ThreeDaysWeather threeDaysWeather={this.props.weather.threeDayData}/>
                        </div>
                    </div>
                </div>
            </div>;
        return (
            <div>
                {cityData}
            </div>
        );
    }
}

export default ShowCityAndWeather;
