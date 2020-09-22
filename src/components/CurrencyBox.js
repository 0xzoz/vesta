import React, {Component} from "react";
import {numm} from "../lib/Utils";
import EventBus from '../lib/EventBus';
import Close from "../assets/close.svg";
import Loading from "./action-panels/Loading";
import {getLiquidationPrice} from "../lib/Actions";

export default class CurrencyBox extends Component {

    constructor(props) {
        super(props);

        this.state = {
            panel : null,
            prevPanel : null,
            loading: false,
            completed: false,
            failed: false,
            value: 0,
            actioning :''
        };
    }

    showActionPanel = (panel) => {
        if (this.state.panel && panel && panel.name === this.state.panel.name) {
            this.setState({panel : null})
        }
        else {
            this.setState({panel});
        }
    };

    resetPanel = () => {
        this.showActionPanel(null);
        this.setState({completed: false, loading: false, failed: false});
    };

    onCompleted = () => {
        console.log("Action completed",this.state);
        this.setState({completed: true, loading: false });

        setTimeout(this.resetPanel, 2500);
    };

    onFailed = () => {
        console.log("Action failed",this.state);
        this.setState({failed: true, loading: false });

        setTimeout(this.resetPanel, 2500);
    };

    onPanelAction = async (action, value, actioning, silent = false) => {
        if (!silent) {
            EventBus.$on('action-completed', this.onCompleted);
            EventBus.$on('action-failed', this.onFailed);
            this.setState({loading: true, prevPanel: this.state.panel, panel: Loading, actioning: actioning, value});
        }
        return this.props.onPanelAction(action, value);
    };

    onPanelInput = async (value) => {
        this.setState({value})
    };

    render() {

        const {userInfo, title, icon, currency, actions, calculateUsd, formatValue, exceedsMax, currencyValue} = this.props;
        const {panel, actioning, value, loading, completed, failed} = this.state;

        let CustomPanel = null;
        if (panel) {
            CustomPanel = panel;
        }

        let liquidationPrice;
        if (panel)
        switch (panel.name) {
            case 'Deposit':
                liquidationPrice = getLiquidationPrice(value, 0);
                break;
            case 'Withdraw':
                liquidationPrice = getLiquidationPrice(-value, 0);
                break;
            case 'Borrow':
                liquidationPrice = getLiquidationPrice(0, value);
                break;
            case 'Repay':
                liquidationPrice = getLiquidationPrice(0, -value);
                break;
        }

        const containerClass = (panel && (!loading && !completed && !failed)? ' active':'');

        const actionPanelContainerClass =
            (panel? ' active':'') + (loading? ' loading':'') +
            (completed? ' completed':'')+ (failed? ' failed':'');

        return (
            <div className={'currency-box-container'+containerClass}>
                <div className="currency-box">
                    <div className={"currency-box-close" + (panel? ' active':'')}>
                        <img src={Close} onClick={() => this.showActionPanel(null)} />
                    </div>
                    <div className="currency-meta">
                        <div className="currency-icon"><img src={icon} /></div>
                        <div className="currency-title">{title}</div>
                        <div className="currency-value">
                            <p>{formatValue(userInfo)} {currency}</p>
                            <small>{calculateUsd(userInfo)} USD</small>
                        </div>
                    </div>

                    <div className="currency-actions">
                        {!panel && Object.entries(actions).map(([key,v],i) => <button key={i} onClick={() => this.showActionPanel(v)}>{key}</button>)}
                    </div>
                </div>
                <div className={'currency-action-panel-container' + actionPanelContainerClass}>
                    {panel &&
                    <CustomPanel onPanelAction={this.onPanelAction} onPanelInput={this.onPanelInput} userInfo={userInfo}
                                 actioning={actioning} value={value} currency={currency} exceedsMax={exceedsMax}
                                 completed={completed} failed={failed} />
                    }
                    {(!loading && !completed && !failed && panel) &&
                    <div className="currency-action-panel-footer">
                        <div className="even">
                            <div>
                                <label>Current Wallet Balance</label>
                                <div className="value">{parseFloat(userInfo.userWalletInfo.ethBalance).toFixed(4)} ETH</div>
                            </div>
                            <div>
                                <label>Liquidation Price</label>
                                <div className="value">
                                    {liquidationPrice && parseFloat(liquidationPrice[0]).toFixed(2)+' USD'}
                                </div>
                            </div>
                            <div>
                                <label>Borrow Limit</label>
                                <div className="value">

                                </div>
                            </div>
                        </div>
                    </div>
                    }
                </div>
            </div>
        )
    }
}
