// Simple model placeholder for Cart — used by services/controllers as a structural reference
class Cart {
  constructor({ id, user_id }) {
    this.id = id;
    this.user_id = user_id;
  }
}

module.exports = Cart;
