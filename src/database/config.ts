import mongoose from 'mongoose';

export const Connection = async() =>{

    try {
  
        await mongoose.connect(process.env.DB_CNN || '')
        console.log('Base de Datos online!')
        
    } catch (error) {

        console.log(error);
        throw new Error("Error en la base de datos");
        
        
    }


}
