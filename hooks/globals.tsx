interface IGlobals {
    JWT_token?: string;
    userId?: number;
    playerName?: string;
}

const globals : IGlobals = {
    JWT_token: undefined,
    userId: undefined,
    playerName: undefined,
};

export default globals;