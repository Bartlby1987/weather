import React from 'react';
import './AddCity.css';
import Spinner from "../../Spinner/Spinner";

class AddCity extends React.Component {
    constructor(props) {
        super(props);
        this.textInput = React.createRef();
        this.state = {
            text: "",
            spinnerOn: false
        }
    }

    onChangeText = (event) => {
        let str = (event.target.value).trim();
        let newStr = str.replace(/[^A-Za-zА-Яа-яЁё]/g, "");
        this.setState({
            text: newStr
        });
        if (this.state.text !== "") {
            this.setState({buttonStatus: !(this.state.text !== "")});
        }
    };

    onClickAddCity = (event) => {
        this.setState({spinnerOn: true});
        this.props.addCity(this.textInput.current.value, () => this.setState({spinnerOn: false}));
        event.preventDefault();
        this.textInput.current.value = "";
        this.setState({
            text: "",
        });
    };

    onClickRefreshCityData = (event) => {
        this.props.changeSpinnerStatus(true);
        event.preventDefault();
        this.props.onClickRefreshData(() => this.props.changeSpinnerStatus(false));
        this.textInput.current.value = '';
        this.setState({
            text: ""
        });
    };

    render() {
        let disableButton = (this.state.text === "") || (this.state.spinnerOn);
        return (
            <div>
                <form className="form-inline ">
                    <div className="form-group mb-2">
                        <input type="text" size="17" readOnly className="form-control-plaintext"
                               value="Город для добавления "/>
                    </div>
                    <div className="form-group mx-sm-3 mb-2">
                        <input type="text" size="15" className="form-control" ref={this.textInput}
                               onChange={this.onChangeText}/>
                    </div>
                    <div>
                        <button type="submit" className="btn btn-primary mb-2 margin_button"
                                disabled={disableButton}
                                onClick={this.onClickAddCity}>
                            {this.state.spinnerOn ? <div className="position_button"><Spinner/></div> :
                                <div>Добавить</div>}
                        </button>
                        <button type="submit" className="btn btn-primary mb-2 margin_button form-inline"
                                onClick={this.onClickRefreshCityData}
                                disabled={((this.props.weatherData.length === 0))}> &#8634;
                        </button>
                    </div>
                </form>
            </div>
        );
    }
}

export default AddCity;