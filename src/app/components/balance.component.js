import nem from "nem-sdk";

class BalanceCtrl {

    /**
     * Initialize dependencies and properties
     *
     * @params {services} - Angular services to inject
     */
    constructor(DataStore, $filter, $timeout, $scope, Wallet) {
        'ngInject';

        //// Component dependencies region ////
        this._Wallet = Wallet;        
        this._DataStore = DataStore;
        this._$timeout = $timeout;
        this._$filter = $filter;

        //// End dependencies region ////
        if (this._Wallet.network == nem.model.network.data.mainnet.id) {
            this.balance = '0.0000';
            this.balanceXEM = '0.000000';
        } else if (this._Wallet.network == nem.model.network.data.testnet.id) {
            this.balance = '0.000000';
            this.balanceXEM = '0.000000';
        }
        this.currentAccountMosaicData = "";

        //// Component properties region ////
        this.markets = [];
        this.selectedMarket = this._DataStore.market.selected;
        this.selectedMarketXEM = 'XEM';
        this.updateBalance();

        //// End properties region ////
        $scope.$watch(() => this._DataStore.mosaic.metaData, (val) => {
            if (!val) return;
            this.updateBalance();
        }, true);
        
        $scope.$watch(() => this._DataStore.account.transactions.confirmed, (val) => {
            if (!val) return;
            setTimeout(() => {
                this.updateBalance();
            }, 1000);
        }, true);
    }

    //// Component methods region ////
    /**
     * Calculate balance according to selected market
     */
    computeBalance() {
        if (undefined === this._DataStore.account.metaData) return;
        if (this.selectedMarketXEM === 'XEM') {
            this.balanceXEM = this._$filter("fmtNemValue")(this._DataStore.account.metaData.account.balance || 0)[0] + "." + this._$filter("fmtNemValue")(this._DataStore.account.metaData.account.balance || 0)[1];
        } 

        if (this._DataStore.market.selected === 'XPX') {
            let acct = this._DataStore.account.metaData.account.address;
            this.currentAccountMosaicData = undefined !== this._DataStore.mosaic.ownedBy[acct] ? this._DataStore.mosaic.ownedBy[acct]: "";
            if (this.currentAccountMosaicData !== '') {
                if ('prx:xpx' in this.currentAccountMosaicData) {
                    const element = this.currentAccountMosaicData['prx:xpx'];
                    this.currentAccountMosaicData = {
                        'prx:xpx': element
                    };
                } else {
                    this.currentAccountMosaicData = {
                        'prx:xpx': {
                            mosaicId: {
                                name: "xpx",
                                namespaceId: "prx"
                            }
                        }
                    };
                }
                if (this._Wallet.network == nem.model.network.data.mainnet.id) {
                    this.balance = this.fmtAmountMainValue(this.currentAccountMosaicData['prx:xpx']['quantity']);
                } else if (this._Wallet.network == nem.model.network.data.testnet.id) {
                    this.balance = this.fmtAmountTestValue(this.currentAccountMosaicData['prx:xpx']['quantity']);
                }
            };
        } 
    }

    /**
     * Method to format xpx
     * @param data
     */
    fmtAmountTestValue(data) {
    if (data===null) { return }
        if (!data) {
            return "0.0000"
        } else {
            let a = data / 10000
            let b = a.toFixed(4).split('.')
            let r = b[0].split(/(?=(?:...)*$)/).join(" ")
            return r + "." + b[1]
        }
    }

    /**
     * Method to format xpx
     * @param data
     */
    fmtAmountMainValue(data) {
        if (data===null) { return }
            if (!data) {
                return "0.000000"
            } else {
                let a = data / 1000000
                let b = a.toFixed(6).split('.')
                let r = b[0].split(/(?=(?:...)*$)/).join(" ")
                return r + "." + b[1]
            }
        }

    /**
     * Arrange the array of market keys
     */
    arrangeMarkets() {
        this.markets = Object.keys(this._DataStore.market.btc) || [];
        this.markets.unshift('BTC');
        this.markets.unshift('XEM');
    }

    /**
     * Update balance value according to a market key
     *
     * @param {string} marketKey - A market key
     */
    updateBalance(marketKey) {
        if (this._Wallet.network == nem.model.network.data.mainnet.id) {
            this.balance = '0.000000';
        } else if (this._Wallet.network == nem.model.network.data.testnet.id) {
            this.balance = '0.0000';
        }
        this.balanceXEM = '0.000000';
        if (!marketKey) marketKey = this._DataStore.market.selected;
        
        this._$timeout(() => {
            this._DataStore.market.selected = marketKey;
            this.selectedMarket = marketKey;
            this.computeBalance();
            $("#balanceDropdown.open").removeClass("open");
        });
    }

    //// End methods region ////

}

// Balance config
let Balance = {
    controller: BalanceCtrl,
    templateUrl: 'layout/partials/balance.html',
};

export default Balance;