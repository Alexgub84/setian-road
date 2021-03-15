import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash";

import { loadSettings, saveSettings } from "../store/actions/settingsActions";
import { loadOrders, removeOrder } from "../store/actions/orderActions";
import { loadItems } from "../store/actions/itemActions";
import { utils } from "../services/utils";

import { OrdersList } from "../cmps/BackOffice/OrdersList";
import { OrdersTable } from "../cmps/BackOffice/OrdersTable";
import { XSLExport } from "../cmps/BackOffice/XSLExport";
import { ShowDate } from "../cmps/ShowDate";
import { SupplySelect } from "../cmps/BackOffice/SupplySelect";
import { SupplyOptions } from "../cmps/BackOffice/SupplyOptions";
import { TextField, InputLabel } from "@material-ui/core";

class _Control extends Component {
  state = {
    date: null,
    readOnly: {
      freeDeliveryPrice: true,
      supplyDate: true,
      maxGrams: true,
    },
    settings: {},
    supplyType: null,
    supplyDate: null,
    filterBy: {},
  };

  async componentDidMount() {
    await this.props.loadSettings();
    this.setState({ settings: this.props.settings }, () => {
      this.setState({ date: utils.formatDate(this.state.settings.supplyDate) });
      console.log({ settings: this.state.settings });
    });
    await this.props.loadOrders();
    await this.props.loadItems();
  }

  toggleEdit = (ev, field) => {
    ev.preventDefault();
    this.setState((prevState) => {
      return {
        ...prevState,
        readOnly: {
          ...prevState.readOnly,
          [field]: !this.state.readOnly[field],
        },
      };
    });
  };

  handleChange = async ({ target }) => {
    const field = target.name;
    if (target.type === "number") var value = +target.value;
    else if (target.type === "date") {
      value = new Date(target.value).getTime();
    } else value = target.value;

    await this.setState((prevState) => {
      return {
        ...prevState,
        settings: {
          ...prevState.settings,
          [field]: value,
        },
      };
    });
  };

  async onUpdateSettings(ev) {
    ev.preventDefault();
    await this.props.saveSettings(this.state.settings);
    Object.keys(this.state.readOnly).forEach((key) => {
      this.setState({ readOnly: { ...this.state.readOnly, [key]: true } });
    });
  }

  onSupplyMethodChange = (ev) => {
    this.setState({ supplyType: ev.target.value });
  };
  handleSupplyChosen = (supplyDate) => {
    this.setState({ supplyDate });
  };

  render() {
    const { orders, items } = this.props;
    const { settings } = this.state;

    if (!this.props.loggedInUser) return <div></div>;
    if (!items[8] || !items[8].description[0] || _.isEmpty(settings))
      return <div>Loading...</div>;
    return (
      <div className="main-container">
        <form className="control-form">
          <section>
            <InputLabel htmlFor="freeDeliveryPrice">
              מחיר מינימלי למשלוח חינם
            </InputLabel>
            <TextField
              type="number"
              name="freeDeliveryPrice"
              id="freeDeliveryPrice"
              onChange={(ev) => this.handleChange(ev)}
              value={this.state.settings.freeDeliveryPrice}
              disabled={this.state.readOnly.freeDeliveryPrice}
            />
            <button onClick={(ev) => this.toggleEdit(ev, "freeDeliveryPrice")}>
              ערוך
            </button>
          </section>
          <section>
            <InputLabel htmlFor="supplyDate">מועד משלוח הבא</InputLabel>
            {this.state.date && (
              <TextField
                id="supplyDate"
                name="supplyDate"
                label="Birthday"
                type="date"
                format="dd/MM/yyyy"
                defaultValue={this.state.date}
                disabled={this.state.readOnly.supplyDate}
                onChange={(ev) => this.handleChange(ev)}
                // className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
            <button onClick={(ev) => this.toggleEdit(ev, "supplyDate")}>
              ערוך
            </button>
          </section>
          <section>
            <InputLabel htmlFor="maxGrams">מקסימום גרמים להזמנה</InputLabel>
            <TextField
              type="number"
              name="maxGrams"
              id="maxGrams"
              onChange={(ev) => this.handleChange(ev)}
              value={this.state.settings.maxGrams}
              disabled={this.state.readOnly.maxGrams}
            />
            <button onClick={(ev) => this.toggleEdit(ev, "maxGrams")}>
              ערוך
            </button>
          </section>
          <button onClick={(ev) => this.onUpdateSettings(ev)}>
            {" "}
            שמור שינויים
          </button>
        </form>
        <SupplySelect onSupplyMethodChange={this.onSupplyMethodChange} />
        {this.state.supplyType && (
          <SupplyOptions
            settings={settings}
            supplyType={this.state.supplyType}
            handleSupplyChosen={this.handleSupplyChosen}
          />
        )}

        <XSLExport items={items} orders={orders} fileName="Report for 10/2" />
        {orders.length !== 0 && (
          <OrdersTable orders={orders} removeOrder={this.props.removeOrder} />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    settings: state.settingsReducer.settings,
    loggedInUser: state.userReducer.loggedInUser,
    orders: state.orderReducer.orders,
    items: state.itemReducer.items,
  };
};

const mapDispatchToProps = {
  loadSettings,
  saveSettings,
  loadOrders,
  removeOrder,
  loadItems,
};

export const Control = connect(mapStateToProps, mapDispatchToProps)(_Control);
