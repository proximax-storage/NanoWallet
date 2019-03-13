import nem from "nem-sdk";

class BalanceCtrl {

    /**
     * Initialize dependencies and properties
     *
     * @params {services} - Angular services to inject
     */
    constructor(DataStore, $filter, $timeout, $scope) {
        'ngInject';

        //// Component dependencies region ////
        
        this._DataStore = DataStore;
        this._$timeout = $timeout;
        this._$filter = $filter;

        //// End dependencies region ////
        this.balance = '0.0000';
        this.currentAccountMosaicData = "";

        //// Component properties region ////

        this.markets = [];
        this.selectedMarket = this._DataStore.market.selected;
        this.updateBalance();

        //// End properties region ////

        // Deep watch balance changes
        $scope.$watch(() => this._DataStore.account.metaData, (val) => {
            if (!val) return;
            this.updateBalance();
        }, true);

        // Deep watch market changes
        // $scope.$watch(() => this._DataStore.market, (val, oldVal) => {
        //     if (!val || !val.btc || !val.xem) return;
        //     // Ignore selected market changes
        //     if (val.selected !== oldVal.selected) return;
        //     this.arrangeMarkets()
        //     this.updateBalance();
        // }, true);
    }

    //// Component methods region ////

    // /**
    //  * Calculate balance according to selected market
    //  */
    // computeBalance() {
    //     if (undefined === this._DataStore.account.metaData) return;
    //     if (this._DataStore.market.selected === 'XEM') {
    //         this.balance = this._$filter("fmtNemValue")(this._DataStore.account.metaData.account.balance || 0)[0] + "." + this._$filter("fmtNemValue")(this._DataStore.account.metaData.account.balance || 0)[1];
    //     } else if (this._DataStore.market.selected === 'BTC') {
    //         this.balance = this._$filter("btcFormat")(this._DataStore.account.metaData.account.balance / 1000000 * this._DataStore.market.xem.highestBid);
    //     } else {
    //         this.balance = this._$filter("currencyFormat")(this._DataStore.account.metaData.account.balance / 1000000 * (this._DataStore.market.xem.highestBid * this._DataStore.market.btc[this.selectedMarket].last));
    //     }
    // }

    /**
     * Calculate balance according to selected market
     */
    computeBalance() {
        if (undefined === this._DataStore.account.metaData) return;
        if (this._DataStore.market.selected === 'XPX') {
            let acct = this._DataStore.account.metaData.account.address;

            setTimeout(() => {
                this.currentAccountMosaicData = undefined !== this._DataStore.mosaic.ownedBy[acct] ? this._DataStore.mosaic.ownedBy[acct]: "";
                if (this.currentAccountMosaicData !== '') {
                    if ('prx:xpx' in this.currentAccountMosaicData) {
                        const element = this.currentAccountMosaicData['prx:xpx'];
                        this.currentAccountMosaicData = {
                            'prx:xpx': element
                        }
                    } else {
                        this.currentAccountMosaicData = {
                            'prx:xpx': {
                                mosaicId: {
                                    name: "xpx",
                                    namespaceId: "prx"
                                }
                            }
                        }
                    }
                }
                this.balance = this.fmtAmountValue(this.currentAccountMosaicData['prx:xpx']['quantity']);
            }, 500);            
        } else if (this._DataStore.market.selected === 'BTC') {
            this.balance = this._$filter("btcFormat")(this._DataStore.account.metaData.account.balance / 1000000 * this._DataStore.market.xem.highestBid);
        } else {
            this.balance = this._$filter("currencyFormat")(this._DataStore.account.metaData.account.balance / 1000000 * (this._DataStore.market.xem.highestBid * this._DataStore.market.btc[this.selectedMarket].last));
        }
    }

    /**
     * Method to format xpx
     * @param data
     */
    fmtAmountValue(data) {
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
        if (!marketKey) marketKey = this._DataStore.market.selected;

        console.log("Esta es una pruebaaaaaa", marketKey);
        
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
    templateUrl: 'layout/partials/balance.html'
};

export default Balance;