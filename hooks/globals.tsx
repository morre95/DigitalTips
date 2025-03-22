interface IGlobals {
    JWT_token?: string;
    userId?: number;
}

const globals : IGlobals = {
    JWT_token: undefined,
    userId: undefined,
};

export default globals;