

const phase = "testing"

const errorHandler = (err,req,res,next) => {
    const statusCode = res.statusCode ? res.statusCode : 500

    res.status(statusCode);

    res.json({
        message: err.message,
        stack : phase === 'production' ? 'null' : err.stack
    })
}

export default errorHandler;