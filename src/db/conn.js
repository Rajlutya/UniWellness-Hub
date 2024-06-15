const mongoose =require("mongoose");

const uri ="mongodb+srv://rajpatel23112003:L71zprQpoC03lbCZ@cluster0.oekg8zx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri,{
    useNewUrlParser:true,
    useUnifiedTopology:true
    // useCreateIndex:true
}).then(()=>{
    console.log(`Connection Successful`);
}).catch((e)=>{
    console.log(`Connection NOT Successful`,e);
})
