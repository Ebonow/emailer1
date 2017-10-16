import React from 'react';
import Select from 'react-select';
import logo from './logo.svg';

import './App.css';
import 'react-select/dist/react-select.css';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <section>
          <Emailer />
        </section>
      </div>
    );
  }
}

class Emailer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      to: null,
      cc: null,
      subject: '',
      body: '',
      isSending: false,
      bannerText: null,
      bannerClass: ''
    };
  }

  getValidationErrors() {
    let email = this.state || {}, errors = [];

    if (!email.to) {
      errors.push('Recipient is required.');
    }
    if (!email.subject) {
      errors.push('Subject is required.');
    }
    if (!email.body) {
      errors.push('Message is required.');
    }
    return errors.join(' ');
  };

  setBanner(options) {
    this.setState({ bannerText: options.text, bannerClass: options.className });
  };

  sendEmail() {
    const url = 'https://trunkclub-ui-takehome.now.sh/submit';
    const ccs = (this.state.cc || []).map((user) => { return user.email;});
    let email = {
      to: this.state.to[0].email,
      subject: this.state.subject,
      body: this.state.body
    };

    if (ccs.length) {
      email.cc = ccs;
    }

    const options = {
      method: 'post',
      mode: 'no-cors',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(email)
    };

    this.setState({ isSending: true });
  
    fetch(url, options)
      .then((response) => {
        if (response.status === '500') {
          this.setBanner({ text: 'We had an error on our end. Please try again.', className: 'error' });
        }
        else if (response.status === '400') {
          this.setBanner({ text: 'Something looks off. Please review the information and try again.', className: 'error' });
        }
        else if (response.status === '200') {
          this.setBanner({ text: 'Message sent!', className: 'success' });
          this.setState({ to: null, cc: null, subject: '', body: '' });
        }

        this.setState({ isSending: false });
      })
      .catch((response) => {
        // elegantly handled error code goes here!
        this.setState({ isSending: false });
      });
  };

  render() { 
    const onChangeEmailTo = (email) => {
      this.setState({to: [email]});
    }

    const onChangeEmailCc = (email) => {
      let newCc = (this.state.cc || []).concat(email);
      this.setState({ cc: newCc });
    }

    const onChangeSubject = (event) => {
      this.setState({subject: event.target.value});
      console.log(this.state.subject);
    }
      
    const onChangeBody = (event) => {
      this.setState({body: event.target.value});
      console.log(this.state.body);
    }

    const onSendClick = (event) => {
      let errors = this.getValidationErrors();
      
      errors.length ? 
        this.setBanner({ text: errors, className: 'error'}) :
        this.sendEmail();
    }  
      
    const fetchRecipientList = (query) => {
      if (!query) {
        return Promise.resolve({options: []});
      }

      const url = 'https://trunkclub-ui-takehome.now.sh/search/';
      const mapUserValues = (user, i) => {
        return { email: user.email, label: `${user.firstName} ${user.lastName}` };
      };
      const mapJsonResults = (json) => {
        return {
          options: (json.users || []).map(mapUserValues)
        };
      };

      return fetch(url + query)
        .then((response) => { return response.json(); })
        .then((json) => { return mapJsonResults(json); });
    };

    let removeUserTag = (collection, user, index, event) => {
      return false;
    }

    let renderUserTag = (collection) => {
      return collection.map((user, i) => {
        return (
          <div key = {i}> 
            <span
              className = "usertag"
              title = {`${user.label} (${user.email})`}
              onClick = { removeUserTag.bind(this, collection, user, i) }
            >{user.email}</span>
          </div>
        );
      });
    }

    let emailTo = this.state.to;
    let emailCc = this.state.cc;

    return (
        <div className="emailer">

        { emailTo ? (
          <div>
            TO: {renderUserTag(emailTo)}
          </div>
        ) : (  
          <Select.Async
              name="EmailTo" 
              loadOptions={fetchRecipientList}
              onChange={onChangeEmailTo} 
              placeholder="Email Recipient"
            />
        )}
        
        { emailCc ? (
          <div>
            CC: {renderUserTag(emailCc)}
          </div>
        ) : "" }  
        
        <Select.Async 
          name="EmailCc" 
          loadOptions={fetchRecipientList}
          onChange={onChangeEmailCc}
          multi={true}
          placeholder="CC Recipients (optional)"
        />
      
        <input 
          type="text" 
          className="subject Select-control" 
          placeholder="Email subject" 
          value = {this.state.subject}
          onChange = {onChangeSubject}
        />

        <textarea 
          className="body" 
          placeholder="Email message" 
          value = {this.state.body}
          onChange = {onChangeBody}
        />
        <button 
          disabled={this.state.isSending}
          onClick={onSendClick}
        >SEND</button>

        <div className="bannerText {this.state.bannerClass}">{this.state.bannerText}</div>
      </div>
    );
  };
}

export default App;