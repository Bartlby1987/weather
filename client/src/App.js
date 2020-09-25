import React from 'react';
import AuthorizationPanel from "./component/AutorizationPanel/AuthorizationPanel";
import RegistrationPanel from "./component/ RegistrationPanel/RegistrationPanel";
import {Route, Router} from 'react-router-dom';
import UserPanel from "./component/UserPanel/UserPanel";
import Popup from "./component/ShowCitesAndWeather/ShowCityAndWeather/PopUp/PopUp";
// import 'bootstrap/dist/css/bootstrap.min.css';

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

    // async componentDidMount() {
    //     try {
    //         let promise = await this.sendRequest(null, 'main/checkSession', 'GET');
    //         if ("name" in promise && "email" in promise && "login" in promise) {
    //             this.setState({personAuthorizationInfo: promise}, () => {
    //                 history.push('/userPanel')
    //             })
    //         } else {
    //             history.push('/')
    //         }
    //     } catch (err) {
    //         history.push('/')
    //     }
    // }

    closeRegistrationPopup() {
        this.setState({"statusRegistration": ""})
    }

    closeAuthorizationPopup() {
        this.setState({"errorAuthorization": ""})
    }

    sendPostRequest = async (userInfo, url) => {
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: (JSON.stringify(userInfo))
        });
        if (!response.ok) {
            this.setState({error: !this.state.error, errorResponse: response});
            return
        }
        return await response.json();
    };
    sendRequest = async (data, url, method) => {
        let obj = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        if (data) {
            obj.body = JSON.stringify(data)
        }

        let response = await fetch(url, obj);

        return await response.json();
    };

    async sendingUserRegistrationInformation(userInfo) {
        const url = "main/registration";
        let responseStatus = await this.sendPostRequest(userInfo, url)
        this.setState({"statusRegistration": responseStatus})
    }

    async sendingUserAuthorizationInformation(LoginPassword) {
        const url = "main/authorization";
        let response = await this.sendPostRequest(LoginPassword, url)
        if ("name" in response && "email" in response && "login" in response) {
            this.setState({"personAuthorizationInfo": response}, () => history.push('/personInfo'))
            return
        }
        this.setState({"errorAuthorization": response})
    }

    async getPersonInformation() {
        const url = "main/personInfo";
        let response = await this.sendPostRequest({}, url)
        if ("name" in response && "email" in response && "login" in response) {
            this.setState({"personAuthorizationInfo": response})
            return
        }
        this.setState({"errorAuthorization": response})
    }

    async logOutFromSession() {
        const url = "main/logOut";
        await this.sendPostRequest({}, url)
        this.setState({"personAuthorizationInfo": ""})
    }

    render() {
        return (
            <Router history={history}>
                <div>
                    <Route exact path='/' render={() => <AuthorizationPanel error={this.state.errorAuthorization}/>}/>

                    {this.state.errorAuthorization !== "" ?
                        <Popup text={this.state.errorAuthorization}
                               closePopup={this.closeAuthorizationPopup.bind(this)}/>
                        : <Route exact path='/userPanel' render={() => <UserPanel
                            logOutFromSession={this.logOutFromSession.bind(this)}/>}/>}


                    {this.state.statusRegistration === "" ? <Route path='/registration' render={() => <RegistrationPanel
                    />}/> : <Popup text={this.state.statusRegistration}
                                   closePopup={this.closeRegistrationPopup.bind(this)}/>}
                </div>
            </Router>
        );
    }
}

export default App;
