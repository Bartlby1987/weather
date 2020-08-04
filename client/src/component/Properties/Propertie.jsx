import React from 'react';
import ChooseSite from "./ChooseASite/ChooseSite";
import "./Properties.css";

class Propertie extends React.Component {

    render() {
        return (
            <div className="parent">
                <ChooseSite yandexFlag={this.props.yandexFlag} gismeteoFlag={this.props.gismeteoFlag}
                            weatherFlag={this.props.weatherFlag} onOrOffSourceYandex={this.props.onOrOffSourceYandex}
                            onOrOffSourceGismeteo={this.props.onOrOffSourceGismeteo}
                            onOrOffSourceWeather={this.props.onOrOffSourceWeather}
                            onClickChangDownloadsTimeFlag={this.props.onClickChangDownloadsTimeFlag}
                            timeFlag={this.props.timeFlag}
                />
            </div>

        );
    }
}

export default Propertie;