class ApiError extends Error{
    constructor (
        statusCode,message="something went wrong",errors=[],stack="")
        
    {

        super(message)
        this.statusCode=statusCode
        this.message=message
        this.errors=errors
        this.success=false
        this.stack=stack
        this.data=null
         if(this.stack){
            this.stack=stack
         }else{
            Error.captureStackTrace(this,this.constructor)
         }
    }
} 

export {ApiError}