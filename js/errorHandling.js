const handleErrors = (expressApp) => {
    // Not found middleware
    expressApp.use((req, res, next) => next({
        status: 404,
        message: 'not found',
    }));

    // Error Handling middleware
    expressApp.use((err, req, res) => {
        let errCode;
        let errMessage;

        if (err.errors) {
            console.log('111');
            // mongoose validation error
            errCode = 400; // bad request
            const keys = Object.keys(err.errors);
            // report the first validation error
            errMessage = err.errors[keys[0]].message;
        } else {
            console.log('123');
            // generic or custom error
            errCode = err.status || 500;
            errMessage = err.message || 'Internal Server Error';
        }
        res.status(errCode).type('txt')
            .send(errMessage);
    });
};

module.exports.handleErrors = handleErrors;

