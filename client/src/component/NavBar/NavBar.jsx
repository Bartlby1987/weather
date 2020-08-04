import React from 'react';
import {Link} from 'react-router-dom'
import './NavBar.css';

class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "spinner": false,
            source: this.props.source
        };
    }

    onClickShowCityData = () => {
        let source = this.props.source;
        let sourceFromState = this.state.source;
        if (source.yandexFlag === sourceFromState.yandexFlag &&
            source.gismeteoFlag === sourceFromState.gismeteoFlag &&
            source.weatherFlag === sourceFromState.weatherFlag &&
            source.downloadsTime === sourceFromState.downloadsTime) {
        } else {
            this.props.changeSpinnerStatus(true);
            this.props.onClickRefresheData(() => this.props.changeSpinnerStatus(false));
            this.setState({source: this.props.source})
        }
    };

    render() {
        return (
            <nav className="navbar navbar-light bg-light">
                <form className="form-inline">
                    <Link to="/">
                        <div>
                            <button className="btn btn-outline-success" type="button"
                                    onClick={this.onClickShowCityData}> Главная страница
                            </button>
                        </div>
                    </Link>
                    <Link to="/Properties">
                        <div className="padding">
                            <button className="btn btn-outline-success" type="button">Настройки</button>
                        </div>
                    </Link>
                </form>
            </nav>
        );
    }
}

export default NavBar;
