import React from 'react';
import axios from "axios";
import '../styles/styles.css';
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";

export default class Converter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            result: null,
            fromCurrency: "RUB",
            toCurrency: "EUR",
            amount: 1,
            currencies: []
        };
    }

    componentWillMount() {
        console.log('componentWillMount');
    }

    componentDidMount() {
        axios
            .get("https://api.exchangerate-api.com/v4/latest/RUB")
            .then(response => {
                const currencyAr = [];
                for (const key in response.data.rates) {
                    currencyAr.push(key);
                    console.log(key);
                }
                this.setState({currencies: currencyAr});
            })
            .catch(err => {
                console.log("oppps", err);
            });
    }

    componentDidUpdate() {
        console.log('componentDidUpdate');
    }

    convertHandler = () => {
        axios
            .get(
                `https://api.exchangerate-api.com/v4/latest/${this.state.fromCurrency}`
            )
            .then(response => {
                const result =
                    this.state.amount * response.data.rates[this.state.toCurrency];
                this.setState({result: result.toFixed(5)});
            })
            .catch(error => {
                console.log("Error", error.message);
            });
    };

    selectHandler = event => {
        if (event.target.name === "from") {
            this.setState({fromCurrency: event.target.value});
        } else {
            if (event.target.name === "to") {
                this.setState({toCurrency: event.target.value});
            }
        }
    };

    render() {
        return (
            <div className="layout">
                <form className="container" noValidate autoComplete="off">
                    <TextField
                        value={this.state.amount}

                        onChange={(e) => {
                            if(e.target.value === '' || /^\d+$/.test(e.target.value)) {
                                this.setState({amount: e.target.value})
                            } else {
                                return false;
                            }
                        }}
                        label="Сумма"
                        margin="normal"
                    />
                    <TextField
                        name="from"
                        select
                        label="Откуда"
                        className="text-field"
                        onChange={event => this.selectHandler(event)}
                        value={this.state.fromCurrency}
                        SelectProps={{
                            MenuProps: {
                                className: "menu",
                            },
                        }}
                        // helperText="Please select your currency"
                        margin="normal"
                        variant="outlined"
                    >
                        {this.state.currencies.map(option => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        name="to"
                        select
                        label="Куда"
                        className="text-field"
                        onChange={event => this.selectHandler(event)}
                        value={this.state.toCurrency}
                        SelectProps={{
                            MenuProps: {
                                className: "menu",
                            },
                        }}
                        // helperText="Please select your currency"
                        margin="normal"
                        variant="outlined"
                    >
                        {this.state.currencies.map(option => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={this.convertHandler}
                        size="medium"
                    >
                        Посчитай
                    </Button>

                </form>
                <h3>
                    Результат:
                </h3>
                {this.state.result && <h3>{this.state.result}</h3>}
            </div>

        );
    }
}
