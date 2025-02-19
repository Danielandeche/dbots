import { useEffect, useState } from 'react';
import clsx from 'clsx';
import Cookies from 'js-cookie';
import { Outlet } from 'react-router-dom';
import { api_base } from '@/external/bot-skeleton';
import { useOauth2 } from '@/hooks/auth/useOauth2';
import { requestOidcAuthentication } from '@deriv-com/auth-client';
import { useDevice } from '@deriv-com/ui';
import { crypto_currencies_display_order, fiat_currencies_display_order } from '../shared';
import Footer from './footer';
import AppHeader from './header';
import Body from './main-body';
import './layout.scss';

const Layout = () => {
    const { isDesktop } = useDevice();

    const { isOAuth2Enabled } = useOauth2();

    const isCallbackPage = window.location.pathname === '/callback';
    const isLoggedInCookie = Cookies.get('logged_state') === 'true';
    const isEndpointPage = window.location.pathname.includes('endpoint');
    const checkClientAccount = JSON.parse(localStorage.getItem('clientAccounts') ?? '{}');
    const getQueryParams = new URLSearchParams(window.location.search);
    const currency = getQueryParams.get('account') ?? '';
    const accountsList = JSON.parse(localStorage.getItem('accountsList') ?? '{}');
    const isClientAccountsPopulated = Object.keys(accountsList).length > 0;
    const ifClientAccountHasCurrency =
        Object.values(checkClientAccount).some(account => account.currency === currency) ||
        currency === 'demo' ||
        currency === '';
    const [clientHasCurrency] = useState(ifClientAccountHasCurrency);

    const validCurrencies = [...fiat_currencies_display_order, ...crypto_currencies_display_order];
    const query_currency = (getQueryParams.get('account') ?? '')?.toUpperCase();
    const isCurrencyValid = validCurrencies.includes(query_currency);
    const api_accounts = [];
    let subscription: { unsubscribe: () => void };

    const validateApiAccounts = ({ data }: any) => {
        if (data.msg_type === 'authorize') {
            api_accounts.push(data.authorize.account_list || []);
            console.log('api_accounts', api_accounts);
            console.log('checkClientAccount', checkClientAccount);
            api_accounts?.flat().map(data => {
                Object.values(checkClientAccount).map(key => {
                    console.log('outside data.currency', data.currency);
                    console.log('outside key.currency', key.currency);
                    if (data.currency !== key.currency) {
                        console.log('setClientHasCurrency');
                        console.log('data.currency', data.currency);
                        console.log('key.currency', key.currency);
                        //setClientHasCurrency(false);
                    }
                });
            });

            if (subscription) {
                subscription?.unsubscribe();
            }
        }
    };

    useEffect(() => {
        if (isCurrencyValid && api_base.api) {
            // Subscribe to the onMessage event
            subscription = api_base.api.onMessage().subscribe(validateApiAccounts);
        }
    }, []);

    console.log('clientHasCurrency', clientHasCurrency);

    useEffect(() => {
        if (isLoggedInCookie && !isClientAccountsPopulated && isOAuth2Enabled && !isEndpointPage && !isCallbackPage) {
            console.log('requestOidcAuthentication');
            requestOidcAuthentication({
                redirectCallbackUri: `${window.location.origin}/callback`,
            });
        }
    }, [
        isLoggedInCookie,
        isClientAccountsPopulated,
        isOAuth2Enabled,
        isEndpointPage,
        isCallbackPage,
        clientHasCurrency,
    ]);

    return (
        <div className={clsx('layout', { responsive: isDesktop })}>
            {!isCallbackPage && <AppHeader />}
            <Body>
                <Outlet />
            </Body>
            {!isCallbackPage && isDesktop && <Footer />}
        </div>
    );
};

export default Layout;
