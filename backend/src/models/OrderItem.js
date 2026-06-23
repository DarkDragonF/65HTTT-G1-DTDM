class OrderItem {
  constructor({ id, order_id, food_id, quantity, unit_price }) {
    this.id = id;
    this.order_id = order_id;
    this.food_id = food_id;
    this.quantity = quantity;
    this.unit_price = unit_price;
  }
}

module.exports = OrderItem;
