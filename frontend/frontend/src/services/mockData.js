export const mockCanteens = [
  { id: 1, name: "Canteen KTX", address: "Khu nội trú TLU", description: "Cơm bình dân, bún, phở" },
  { id: 2, name: "Cafe Giảng Đường", address: "Tầng 1 Tòa A", description: "Đồ uống, ăn vặt" },
  { id: 3, name: "Tiệm Bánh TLU", address: "Cổng chính", description: "Bánh mì, bánh ngọt" },
  { id: 4, name: "Cơm Tấm Cô Ba", address: "Cổng ngõ 95", description: "Cơm tấm sườn bì chả" }
];
// ... (giữ nguyên mockCanteens ở trên)

export const mockFoods = [
  { id: 1, canteen_id: 1, name: "Cơm sườn xào chua ngọt", price: 35000, description: "Kèm canh và rau xào" },
  { id: 2, canteen_id: 1, name: "Bún chả Hà Nội", price: 30000, description: "Chả nướng than hoa" },
  { id: 3, canteen_id: 2, name: "Cà phê muối", price: 20000, description: "Cà phê đậm đà vị muối biển" },
  { id: 4, canteen_id: 3, name: "Bánh mì xíu mại", price: 15000, description: "Bánh mì nóng giòn" }
];