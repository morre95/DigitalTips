import React from 'react';
import {TokenProvider} from "@/components/login/LoginContext";
import CheckOutToken from "@/components/login/CheckOutToken";

const SignInApp = () => {
    return (
        <TokenProvider>
            <CheckOutToken />
        </TokenProvider>
    )
}


export default SignInApp;