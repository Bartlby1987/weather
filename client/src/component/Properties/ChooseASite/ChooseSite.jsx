import React from 'react';
import './ChooseSite.css';

class AddAndDeleteCity extends React.Component {

    render() {
        return (
            <div className="div_border2">
                <div className="checkbox_style_1">
                    <div><h3>Выберите сайт для отображения погоды</h3></div>
                    <div>
                        <div className="custom-control custom-checkbox">
                            <input type="checkbox" className="custom-control-input" id="defaultInline1"
                                   onChange={this.props.yandexFlag}
                                   checked={this.props.onOrOffSourceYandex}/>
                            <label className="custom-control-label" htmlFor="defaultInline1"><h5>Yandex</h5></label>
                        </div>
                        <div className="custom-control custom-checkbox ">
                            <input type="checkbox" className="custom-control-input" id="defaultInline2"
                                   onChange={this.props.gismeteoFlag}
                                   checked={this.props.onOrOffSourceGismeteo}/>
                            <label className="custom-control-label" htmlFor="defaultInline2"><h5>Gismeteo</h5></label>
                        </div>
                        <div className="custom-control custom-checkbox ">
                            <input type="checkbox" className="custom-control-input" id="defaultInline3"
                                   onChange={this.props.weatherFlag}
                                   checked={this.props.onOrOffSourceWeather}/>
                            <label className="custom-control-label" htmlFor="defaultInline3"><h5>Weather.com</h5>
                            </label>
                        </div>
                    </div>
                </div>
                <div>
                    <div><h3>Включение отображения времени загрузки</h3></div>
                    <div className="custom-control custom-checkbox ">
                        <input type="checkbox" className="custom-control-input" id="defaultInline4"
                               onChange={this.props.onClickChangDownloadsTimeFlag}
                               checked={this.props.timeFlag}/>
                        <label className="custom-control-label" htmlFor="defaultInline4"><h5>Отображение времени</h5>
                        </label>
                    </div>
                </div>
                </div>
        );
    }
}

export default AddAndDeleteCity;