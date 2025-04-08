import React from 'react';
import {TokenProvider} from "@/components/login/LoginContext";
import CheckOutToken from "@/components/login/CheckOutToken";

const LoginTest = () => {
    return (
        <TokenProvider>
            <CheckOutToken />
        </TokenProvider>
    )
}


export default LoginTest;