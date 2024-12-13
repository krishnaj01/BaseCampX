//making a function to catch all async errors to avoid try and catching in individual async functions
function catchAsync(fn){
    return function (req,res,next){
        fn(req,res,next).catch(e => next(e));
    }
}

module.exports = catchAsync;