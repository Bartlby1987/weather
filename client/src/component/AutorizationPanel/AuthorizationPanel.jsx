import React from 'react';
import "./AuthorizationPanel.css"
import {Link} from 'react-router-dom';

class AuthorizationPanel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            login: '',
            password: ''
        }

        this.handleInputChange = this.handleInputChange.bind(this)
    }

    handleInputChange(event) {
        const target = event.target
        const value = target.value
        const name = target.name
        this.setState({
            [name]: value
        })
    }

    onClickUserSingUp() {
        this.props.getUserInformation(this.state)
    }

    render() {
        let disableButton;
        let map = new Map(Object.entries(this.state))
        for (let [, value] of map) {
            disableButton = value.trim() === '';
        }

        return (
            <div className="body bodyColor">
                <div className="wrapper fadeInDown">
                    <div id="formContent">
                        <h2 className="active h2 ">
                            <div className="sizeHref">Sign In</div>
                        </h2>
                        <Link to='/registration'>
                            <h2 className="inactive underlineHover h2">
                                <div className="sizeHref">Sign Up</div>
                            </h2>
                        </Link>
                        <form>
                            <input type="text" id="login" className="fadeIn second" name="login" placeholder="login"
                                   value={this.state.login} onChange={this.handleInputChange}/>
                            <input type="password" id="password" className="fadeIn third" name="password"
                                   value={this.state.password} onChange={this.handleInputChange}
                                   placeholder="password"/>
                            <input onClick={this.onClickUserSingUp.bind(this)} type="button"
                                   className={"fadeIn fourth"} disabled={disableButton}
                                   value="Log In"/>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}


export default AuthorizationPanel;
