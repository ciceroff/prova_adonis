import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Cart from 'App/Models/Cart'

export default class CartsController {
    public async update({request}:HttpContextContract){
        const cart = await Cart.findOrFail(1)
        const {new_value} = request.body()
        
        try{
            cart.minCartValue = new_value
            cart.save()
        }catch(error){
            return error.detail
        }
    }
}
