class Delivery {
  constructor({ id, order_id, delivery_staff_id, status, assigned_at }) {
    this.id = id;
    this.order_id = order_id;
    this.delivery_staff_id = delivery_staff_id;
    this.status = status;
    this.assigned_at = assigned_at;
  }
}

module.exports = Delivery;
