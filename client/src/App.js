import React from 'react';
import AuthorizationPanel from "./component/AutorizationPanel/AuthorizationPanel";
import RegistrationPanel from "./component/ RegistrationPanel/RegistrationPanel";
import {Route, Router} from 'react-router-dom';
import UserPanel from "./component/UserPanel/UserPanel";
import Popup from "./component/ShowCitesAndWeather/ShowCityAndWeather/PopUp/PopUp";
import 'bootstrap/dist/css/bootstrap.min.css';

import {createBrowserHistory} from "history";
const history = createBrowserHistory();
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            statusRegistration: "",
            personAuthorizationInfo: "",
            errorAuthorization: ""
        }
    };

    async componentDidMount() {
        try {
            let promise = await this.sendRequest(null, '/users/checkSession', 'GET');
            if ("USER_ID" in promise) {
                this.setState({personAuthorizationInfo: promise}, () => {
                    history.push('/userPanel/main')
                })
            } else {
                history.push('/')
            }
        } catch (err) {
            history.push('/')
        }
    }

    closeRegistrationPopup() {
        this.setState({"statusRegistration": ""});
        history.push('/');
    }

    closeAuthorizationPopup() {
        this.setState({"errorAuthorization": ""})
    }

    sendRequest = async (data, url, method) => {
        let obj = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        if (data) {
            obj.body = JSON.stringify(data)
        }
        let response = await fetch(url, obj);
        return await response.json();
    };

    async sendingUserRegistrationInformation(userInfo) {
        const url = "users/registration";
        const method = "POST";
        let responseStatus = await this.sendRequest(userInfo, url, method)
        this.setState({"statusRegistration": responseStatus})
    }

    async sendingUserAuthorizationInformation(LoginPassword) {
        const url = "users/authorization";
        const method = "POST";
        let response = await this.sendRequest(LoginPassword, url, method)
        console.log(response);
        if ((typeof response) !== "string") {
            this.setState({"personAuthorizationInfo": response}, () => history.push('/userPanel/main'))
            return
        }
        this.setState({"errorAuthorization": response})
    }
    async logOutFromSession() {
        const url = "/users/logOut";
        await this.sendRequest(null, url, "POST")
        this.setState({"personAuthorizationInfo": ""})
        history.push('/');
    }

    render() {
        let information;
        if (this.state.errorAuthorization !== "") {
            information = <div>
                <Popup text={this.state.errorAuthorization}
                       closePopup={this.closeAuthorizationPopup.bind(this)}/>
            </div>
        } else if (this.state.personAuthorizationInfo !== "") {
            information = <Route path='/userPanel/'
                                 render={() => <UserPanel logOutFromSession={this.logOutFromSession.bind(this)}/>}/>
        } else {
            information = <Route exact path='/' render={() => <AuthorizationPanel
                authorizationUser={this.sendingUserAuthorizationInformation.bind(this)}/>}/>
        }

        return (
            <Router history={history}>
                <div>
                    {information}
                    {this.state.statusRegistration === "" ?
                        <Route path='/registration' render={() => <RegistrationPanel sendingUserRegistrationInformation=
                                                                                         {this.sendingUserRegistrationInformation.bind(this)}/>}/> :
                        <Popup text={this.state.statusRegistration}
                               closePopup={this.closeRegistrationPopup.bind(this)}/>}
                </div>
            </Router>
        );
    }
}
export default App;