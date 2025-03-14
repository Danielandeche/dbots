const token = 'Replace with your own token';

// console.log('Starting bot...');

window.Bot.init(token, {
    symbol: 'R_100',
    candleInterval: 60,
    contractTypes: ['CALL', 'PUT'],
});

// eslint-disable-next-line no-constant-condition
while (true) {
    window.Bot.start({
        amount: 1,
        currency: 'USD',
        duration: 2,
        duration_unit: 'h',
        basis: 'stake',
    });

    // console.log('Preparing Proposals');

    window.watch('before');

    window.Bot.apollo_purchase('CALL');

    // console.log('Purchased:', 'CALL');

    while (window.watch('during')) {
        if (window.Bot.isSellAvailable()) {
            window.Bot.sellAtMarket();
            // console.log('Contract Sold');
        }
    }

    // console.log('Purchase finished:', window.Bot.readDetails(1));

    window.sleep(1); // Prevent max sell alert because of trading too fast
}
