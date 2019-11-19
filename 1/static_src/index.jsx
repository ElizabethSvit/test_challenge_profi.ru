import React from 'react';
import ReactDOM from 'react-dom';
import Converter from './components/Converter.jsx';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

ReactDOM.render(
    <MuiThemeProvider>
        <Converter/>
    </MuiThemeProvider>,
    document.getElementById('root'),
);

