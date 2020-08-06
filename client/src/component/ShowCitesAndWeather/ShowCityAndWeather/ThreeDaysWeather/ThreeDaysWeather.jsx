import React from 'react';
import './ThreeDaysWeather.css'
import clearWeatherSvg from './img/clearWeather.svg'
import snowWeatherSvg from './img/snowWeather.svg'
import rainWeatherSvg from './img/rainWeather.svg'
import overcastWeatherSvg from './img/overcastWeather.svg'

class ThreeDaysWeather extends React.Component {

    render() {
        const clearWeather = <img src={clearWeatherSvg} alt="" title="Ожидаеться ясная погода"/>;
        const snowWeather = <img src={snowWeatherSvg} alt="" title="Ожидается снег"/>;
        const rainWeather = <img src={rainWeatherSvg} alt="" title="Ожидается дождь"/>;
        const overcastWeather = <img src={overcastWeatherSvg} alt="" title="Ожидаються Осадки"/>;
        let firstDayWeather;
        let secondDayWeather;
        let thirdDayWeather;
        let firstDayHumidity;
        let secondDayHumidity;
        let thirdDayHumidity;
        let firstNightHumidity;
        let secondNightHumidity;
        let thirdNightHumidity;
        let firstWeekDay;
        let secondWeekDay;
        let thirdWeekDay;
        let firstMounthData;
        let secondMounthData;
        let thirdMounthData;
        let newDataTempArray;
        try {
            firstDayWeather = this.props.threeDaysWeather[0];
            secondDayWeather = this.props.threeDaysWeather[1];
            thirdDayWeather = this.props.threeDaysWeather[2];
            firstWeekDay = firstDayWeather["date"].split(",")[0];
            secondWeekDay = secondDayWeather["date"].split(",")[0];
            thirdWeekDay = thirdDayWeather["date"].split(",")[0];
            firstMounthData = firstDayWeather["date"].split(",")[1];
            secondMounthData = secondDayWeather["date"].split(",")[1];
            thirdMounthData = thirdDayWeather["date"].split(",")[1];
            firstDayHumidity = firstDayWeather["humidityDay"];
            secondDayHumidity = secondDayWeather["humidityDay"];
            thirdDayHumidity = thirdDayWeather["humidityDay"];
            firstNightHumidity = firstDayWeather["humidityNight"];
            secondNightHumidity = secondDayWeather["humidityNight"];
            thirdNightHumidity = thirdDayWeather["humidityNight"];
            let dataTempArray = [Number(firstDayWeather["tempDay"]), Number(secondDayWeather["tempDay"]), Number(thirdDayWeather["tempDay"]),
                Number(firstDayWeather["tempNight"]), Number(secondDayWeather["tempNight"]), Number(thirdDayWeather["tempNight"])];
            newDataTempArray = dataTempArray.map(function (currentValue) {
                if (currentValue > 0) {
                    return "+" + currentValue
                } else if (currentValue === 0) {
                    return 0
                } else {
                    return currentValue
                }
            })
        } catch (e) {
            newDataTempArray = [" ", " ", " ", " ", " ", " "];
            firstDayHumidity = " ";
            secondDayHumidity = " ";
            thirdDayHumidity = " ";
            firstNightHumidity = " ";
            secondNightHumidity = " ";
            thirdNightHumidity = " ";
            firstWeekDay = " ";
            secondWeekDay = " ";
            thirdWeekDay = " ";
            firstMounthData = " ";
            secondMounthData = " ";
            thirdMounthData = " ";
        }

        let weatherData = {
            "Ясно": clearWeather,
            "Дождь": rainWeather,
            "Снег": snowWeather,
            "Осадки": overcastWeather
        };

        return (
            <div className="size">
                <h5>
                    Прогноз на три дня.
                </h5>
                <table border="1" align="center" className="forecast_data_position table_size">
                    <tbody>
                    <tr>
                        <th>Д/Н</th>
                        <th>
                            <div>{firstWeekDay + "," + firstMounthData}</div>
                        </th>
                        <th>
                            <div>{secondWeekDay + "," + secondMounthData}</div>
                        </th>
                        <th>
                            <div>{thirdWeekDay + "," + thirdMounthData}</div>
                        </th>
                    </tr>
                    <tr>
                        <td>День</td>
                        <td>{weatherData[firstDayHumidity]} {newDataTempArray["0"]}</td>
                        <td>{weatherData[secondDayHumidity]} {newDataTempArray["1"]}</td>
                        <td>{weatherData[thirdDayHumidity]} {newDataTempArray["2"]}</td>
                    </tr>
                    <tr>
                        <td>Ночь</td>
                        <td>{weatherData[firstNightHumidity]} {newDataTempArray["3"]}</td>
                        <td>{weatherData[secondNightHumidity]} {newDataTempArray["4"]}</td>
                        <td>{weatherData[thirdNightHumidity]} {newDataTempArray["5"]}</td>
                    </tr>
                    </tbody>
                </table>
            </div>

        );
    }
}

export default ThreeDaysWeather;
