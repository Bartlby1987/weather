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
            let promise = await this.sendRequest(null, '/weather/checkSession', 'GET');
            if ("name" in promise && "email" in promise && "login" in promise) {
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

    // sendPostRequest = async (userInfo, url,method) => {
    //     let response = await fetch(url, {
    //         method: method,
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: (JSON.stringify(userInfo))
    //     });
    //     if (!response.ok) {
    //         this.setState({error: !this.state.error, errorResponse: response});
    //         return
    //     }
    //     return await response.json();
    // };
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
        const url = "weather/registration";
        const method = "POST";
        let responseStatus = await this.sendRequest(userInfo, url, method)
        this.setState({"statusRegistration": responseStatus})
    }

    async sendingUserAuthorizationInformation(LoginPassword) {
        const url = "weather/authorization";
        const method = "POST";
        let response = await this.sendRequest(LoginPassword, url, method)
        console.log(response);
        if ((typeof response) !== "string") {
            this.setState({"personAuthorizationInfo": response}, () => history.push('/userPanel/main'))
            return
        }
        this.setState({"errorAuthorization": response})
    }

    // async getPersonInformation() {
    //     const url = "main/personInfo";
    //     let response = await this.sendPostRequest({}, url)
    //     if ("name" in response && "email" in response && "login" in response) {
    //         this.setState({"personAuthorizationInfo": response})
    //         return
    //     }
    //     this.setState({"errorAuthorization": response})
    // }

    async logOutFromSession() {
        const url = "/weather/logOut";
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