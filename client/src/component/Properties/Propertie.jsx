import React from 'react';
import ChooseSite from "./ChooseASite/ChooseSite";
import "./Properties.css";
// import Spinner from "../Spinner/Spinner";

class Properties extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cities: false
        }
    };

    render() {
        return (
            <div>
                <div className="all_props_position">
                    <ChooseSite yandexFlag={this.props.yandexFlag} gismeteoFlag={this.props.gismeteoFlag}
                                weatherFlag={this.props.weatherFlag}
                                onOrOffSourceYandex={this.props.onOrOffSourceYandex}
                                onOrOffSourceGismeteo={this.props.onOrOffSourceGismeteo}
                                onOrOffSourceWeather={this.props.onOrOffSourceWeather}
                                onClickChangDownloadsTimeFlag={this.props.onClickChangDownloadsTimeFlag}
                                timeFlag={this.props.timeFlag}
                    />
                </div>
                <button type="submit" className="btn btn-primary mb-2 margin_button"
                        onClick={this.props.onClickSaveProperties}>
                    <div>Сохранить</div>
                </button>
            </div>
        );
    }
}

export default Properties;