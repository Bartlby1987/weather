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
        let date = [];
        let tempDay = [];
        let tempNight = [];
        try {
            let weatherData = {
                "Ясно": clearWeather,
                "Дождь": rainWeather,
                "Снег": snowWeather,
                "Осадки": overcastWeather
            };

            let newArr = this.props.threeDaysWeather;

            newArr.forEach(function (elem) {
                let dateDay = <th>
                    <div>{elem.date}</div>
                </th>;
                date.push(dateDay);
            });

            newArr.forEach(function (elem) {
                let temp = <td>{weatherData[elem["humidityDay"]]} {elem["tempDay"]}</td>
                tempDay.push(temp);
            });

            newArr.forEach(function (elem) {
                let temp = <td>{weatherData[elem["humidityNight"]]} {elem["tempNight"]}</td>
                tempNight.push(temp);
            });
        } catch (e) {
            date.push(<th>
                <div></div>
            </th>)
            tempDay.push(<td></td>)
            tempNight.push(<td></td>)
        }
        return (
            <div className="size">
                <h5>
                    Прогноз на три дня.
                </h5>
                <table border="1" align="center" className="forecast_data_position table_size">
                    <tbody>
                    <tr>
                        <th>Д/Н</th>
                        {date}
                    </tr>
                    <tr>
                        <td>День</td>
                        {tempDay}
                    </tr>
                    <tr>
                        <td>Ночь</td>
                        {tempNight}
                    </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default ThreeDaysWeather;
