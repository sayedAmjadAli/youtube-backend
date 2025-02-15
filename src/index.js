import { app  } from "./app.js";
import database from "./config/dbConnection.js";
import { PORT } from "./config/env.js";



database().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is running on PORT: ${PORT}`)
      })
}).catch(err=>{
    console.log("Mongodb Connection ERROR: ",err)
})

