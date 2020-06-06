jwt = {
    secret: process.env.JWT_SECRET || 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAru//ki6E7T3jACIHGqwaV+gm5/ezGFUCqI7k/6Vdh7HvhOCGdL8hyEIUmOcwhYBgmkAFunuZSAq6wq8xk6QjwkHNya9nd+Nfv2/ynfqNgUNBOiYCoIVTTAYmee46tlvXBYrNYHDcPLe1PJTqL4ytgD+WmwE1oHkIZ6qDflHsh0/KnV/+0HZm6qLtW2uPaKqOfF/YitcSNBzlxrDSYBPEH4+FyWx+CGnyxldLhfiV986O6bnAHhOjX81/ASDyE4wsKRgziKR4gRReINblAeRjCwTVT2pCL623+JhrC1Of38U6aJ92zqKJxw5744YcZsSgiVse8O8wccjRsv+nRyMnZQIDAQAB',
    options: {
        audience: 'https://machbarschaft.jetzt',
        expiresIn: '30d', // 1d
        issuer: 'machbarschaft.jetzt'
    },
    cookie: {
        httpOnly: true,
        sameSite: true,
        signed: true,
        secure: false
    }
}

module.exports = {
    tabWidth: 2,
    semi: true,
    singleQuote: true,
    trailingComma: 'es5',
    port: process.env.PORT        || '3000',
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/machbarschaft',
    jwt
}