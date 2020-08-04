import React from 'react';
import './PopUp.css';

class Popup extends React.Component {
    render() {
        return (
            <div className='popup'>
                <div className='popup\_inner center'>
                    <h1>{this.props.text}</h1>
                    <button type="button" className="btn btn-primary" onClick={this.props.closePopup}>CLOSE</button>
                </div>
            </div>
        );
    }
}

export default Popup;