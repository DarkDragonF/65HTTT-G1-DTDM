class CartItem {
  constructor({ id, cart_id, food_id, quantity }) {
    this.id = id;
    this.cart_id = cart_id;
    this.food_id = food_id;
    this.quantity = quantity;
  }
}

module.exports = CartItem;
