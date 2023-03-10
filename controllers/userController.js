import Deal from "../models/dealModel.js";
import Order from "../models/orderModel.js";

//get all unexpired deals

export const getAllDeals = async (req, res) => {
  
  try {
    const deals = await Deal.find({
      availableUnits: { $gt: 0 },
      expiryTime: { $gte: Date.now() },
    });

    //for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const indexOfFirstItem = (page - 1) * limit;
    const indexOfLastItem = page * limit;

    const dealsData = {};
    if (indexOfLastItem < deals.length) {
      dealsData.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (indexOfFirstItem > 0) {
      dealsData.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    

    dealsData.deals = deals.slice(indexOfFirstItem, indexOfLastItem);
    res.status(200).json(dealsData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// place order for a lightning deal

export const placeOrder = async(req,res) => {
  try {
    
  
    const id = req.params.id;
    const deal = await Deal.findById(req.params.id);

    if(!deal){
        return res.status(404).json({error:'Deal does not exist'})
    }
    if(deal.expiryTime < Date.now()){
        return res.status(400).json({error:'Deal expired'})
    }
    if(req.body.requiredUnits <= 0){
        return res.status(400).json({error:"Required Units number is invalid"})
    }
    if(req.body.requiredUnits > deal.availableUnits){
        return res.status(400).json({error:"Requested number of units not available"})
    }

    deal.availableUnits -= req.body.requiredUnits;
    
    const updateDeal = await deal.save();
    
    //saving to order collection
    const orderDetails = new Order({
        deal: updateDeal._id,
        email: req.body.email,
        status: 'pending'
    })
    
    const orderSaved = await orderDetails.save();
    
    
    res.status(200).json(orderSaved);
    } catch (error) {
    res.status(500).json({message:error.message})
  }
}



// view order status

export const orderStatus = async(req,res) => {
   try {
     const order = await Order.findById(req.params.id);
     if(!order){
        return res.status(404).json({error:"Order does not exist"})
     }
     res.status(200).json(order); 
   } catch (error) {
    res.status(500).json({message:error.message})
      
   }
}