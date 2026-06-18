class Order {
  constructor({ id, user_id, total_amount, status, created_at }) {
    this.id = id;
    this.user_id = user_id;
    this.total_amount = total_amount;
    this.status = status;
    this.created_at = created_at;
  }
}

module.exports = Order;
